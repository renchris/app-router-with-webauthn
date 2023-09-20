'use server'

import {
  type VerifiedAuthenticationResponse,
  GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server'
import { PublicKeyCredentialWithAssertionJSON } from '@github/webauthn-json'
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/typescript-types'
import prisma from '@lib/prisma'
import {
  getCredentialsOfUser, getUserFromEmail,
} from '@lib/database'
import {
  User, Credential,
} from '@prisma/client'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { setChallengeToCookieStorage } from '@lib/cookieActions'
import { verifyAuthentication } from './verifyAuthentication'

const generateAuthenticationOptionsStep = async (
  usersCredentials: Credential[] | Error,
):
Promise<PublicKeyCredentialRequestOptionsJSON> => {
  const loginOptionsParameters: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: (usersCredentials as Credential[]).map((userCredential) => ({
      id: Uint8Array.from(userCredential.externalId, (c) => c.charCodeAt(0)),
      type: 'public-key',
    })),
    userVerification: 'required',
    rpID: 'localhost',
  }
  const authenticationOptionsJSON = generateAuthenticationOptions(loginOptionsParameters)
  await setChallengeToCookieStorage(authenticationOptionsJSON.challenge)
  return authenticationOptionsJSON
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
  verifyAuthentication(
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
