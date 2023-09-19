'use server'

import {
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server'
import { User, Credential } from '@prisma/client'
import prisma from '@lib/prisma'
import { clean, binaryToBase64url } from '@lib/auth'

export const registerUser = async (
  email: string,
  username: string,
  verification: VerifiedRegistrationResponse,
): Promise<User | Error> => {
  const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {}

  if (credentialID == null || credentialPublicKey == null) {
    throw new Error('Registration failed')
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        credentials: {
          create: {
            externalId: await clean(await binaryToBase64url(credentialID)),
            publicKey: Buffer.from(credentialPublicKey),
          },
        },
      },
    })

    console.log(`Registered new user ${user.id}`)
    return user
  }
  throw new Error('User with this email already exists')
}

export async function getUserFromEmail(email: string): Promise<User | Error> {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  if (!existingUser) {
    throw new Error('User with this email does not exist')
  }
  return existingUser
}

export async function getCredentialsOfUser(user: User): Promise<Credential[] | Error> {
  try {
    const userId = user.id
    const credentials = await prisma.credential.findMany({
      where: {
        userId,
      },
    })
    return credentials
  } catch (error) {
    console.error('Error fetching credentials:', error)
    throw error
  }
}

export async function updateCredentialSignCount(
  credentialIdToUpdate: string,
  newSignCount: number,
) {
  try {
    const updatedCredential = await prisma.credential.update({
      where: { externalId: credentialIdToUpdate },
      data: { signCount: newSignCount },
    })

    console.log('Updated Credential:', updatedCredential)
  } catch (error) {
    console.error('Error updating Credential:', error)
  }
}
