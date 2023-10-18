'use server'

import type {
  VerifiedAuthenticationResponse,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'
import {
  verifyAuthenticationResponse,
  generateAuthenticationOptions,
} from '@simplewebauthn/server'
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticatorDevice,
} from '@simplewebauthn/typescript-types'
import prisma from '@lib/prisma'
import {
  getCredentialsOfUser, getUserFromEmail,
  updateCredentialSignCount,
} from '@lib/database'
import {
  User, Credential,
} from '@prisma/client'
import { setChallengeToCookieStorage, clearCookies } from '@lib/cookieActions'

const generateAuthenticationOptionsStep = async (
  usersCredentials: Credential[] | Error,
):
Promise<PublicKeyCredentialRequestOptionsJSON> => {
  const loginOptionsParameters: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: (usersCredentials as Credential[]).map((userCredential) => ({
      id: new Uint8Array(Buffer.from(userCredential.externalId, 'base64')),
      type: 'public-key',
    })),
    userVerification: 'required',
    rpID: 'localhost',
  }
  const authenticationOptionsJSON = generateAuthenticationOptions(loginOptionsParameters)
  await setChallengeToCookieStorage(authenticationOptionsJSON.challenge)
  return authenticationOptionsJSON
}

export const verifyAuthenticationStep = async (
  userCredential: Credential,
  challenge: string,
  authenticationResponse: AuthenticationResponseJSON,
): Promise<VerifiedAuthenticationResponse> => {
  let verification: VerifiedAuthenticationResponse

  // const responseCredIDBuffer = await base64urlToBuffer(authenticationResponse.rawId)
  // let dbAuthenticator: AuthenticatorDevice | undefined
  // let matchedCredential: Credential | undefined

  const dbAuthenticator: AuthenticatorDevice = {
    credentialID: await base64urlToBuffer(userCredential.externalId),
    credentialPublicKey: userCredential.publicKey,
    counter: userCredential.signCount,
  }

  // userCredentials.forEach((credential) => {
  //   if (Uint8ArraysAreEqual(credential.publicKey, responseCredIDBuffer)) {
  //     dbAuthenticator = {
  //       credentialID: await base64urlToBuffer(credential.externalId),
  //       credentialPublicKey: credential.publicKey,
  //       counter: credential.signCount,
  //     }
  //     matchedCredential = credential
  //   }
  // })

  if (!dbAuthenticator) {
    throw new Error('Authenticator is not registered with this site')
  }

  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: authenticationResponse,
      expectedChallenge: challenge,
      expectedOrigin: 'https://localhost',
      expectedRPID: 'localhost',
      authenticator: dbAuthenticator,
      requireUserVerification: true,
    }
    verification = await verifyAuthenticationResponse(opts)
  } catch (err) {
    const verifyAuthenticationError = err as Error
    throw new Error(verifyAuthenticationError.message)
  }

  const { verified, authenticationInfo } = verification

  if (verified) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    updateCredentialSignCount(userCredential.externalId, authenticationInfo.newCounter)
  }

  await clearCookies()

  return verification
}

export const getAuthenticationOptionsJSON = async (
  email: string,
): Promise<PublicKeyCredentialRequestOptionsJSON> => {
  const userToLogin: User | Error = await getUserFromEmail(email)
  const usersCredentials: Credential[] | Error = await getCredentialsOfUser(userToLogin as User)
  const authenticationOptionsJSON = await
  generateAuthenticationOptionsStep(usersCredentials)
  return authenticationOptionsJSON
}

export const loginProcess = async (
  challenge: string,
  credential: PublicKeyCredentialWithAssertionJSON,
  email: string,
  authenticationResponse: AuthenticationResponseJSON,
) => {
  if (credential?.id == null) {
    throw new Error('Invalid Credentials')
  }

  const userCredential = await prisma.credential.findUnique({
    select: {
      id: true,
      userId: true,
      name: true,
      externalId: true,
      publicKey: true,
      signCount: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    where: {
      externalId: credential.id,
    },
  })

  if (userCredential == null) {
    throw new Error('Unknown User')
  }

  const verification: VerifiedAuthenticationResponse = await
  verifyAuthenticationStep(
    userCredential,
    challenge,
    authenticationResponse,
  )

  try {
    await prisma.credential.update({
      data: {
        signCount: verification.authenticationInfo.newCounter,
      },
      where: {
        id: userCredential.id,
      },
    })
  } catch (error) {
    console.error(error)
    throw error
  }

  if (!verification.verified || email !== userCredential.user.email) {
    throw new Error('Login verification failed')
  }

  console.log(`Logged in as user ${userCredential.userId}`)
  return userCredential.userId
}
