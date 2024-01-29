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
  const authenticationOptionsJSON = await generateAuthenticationOptions(loginOptionsParameters)
  await setChallengeToCookieStorage(authenticationOptionsJSON.challenge)
  return authenticationOptionsJSON
}

export const verifyAuthenticationStep = async (
  userCredential: Credential,
  challenge: string,
  authenticationResponse: AuthenticationResponseJSON,
): Promise<VerifiedAuthenticationResponse> => {
  let verification: VerifiedAuthenticationResponse

  const dbAuthenticator: AuthenticatorDevice = {
    credentialID: new Uint8Array(Buffer.from(userCredential.externalId, 'base64')),
    credentialPublicKey: userCredential.publicKey,
    counter: userCredential.signCount,
  }

  if (!dbAuthenticator) {
    throw new Error('Authenticator is not registered with this site')
  }

  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: authenticationResponse,
      expectedChallenge: challenge,
      expectedOrigin: 'http://localhost:3000',
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

export const loginUser = async (
  challenge: string,
  email: string,
  authenticationResponse: AuthenticationResponseJSON,
): Promise<User | Error> => {
  if (authenticationResponse?.id == null) {
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
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    where: {
      externalId: authenticationResponse.id,
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

  const { user } = userCredential

  if (!verification.verified || email !== user.email) {
    throw new Error('Login verification failed')
  }

  console.log(`Logged in as user ${user.id}`)
  return user
}
