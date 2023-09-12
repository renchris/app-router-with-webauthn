'use server'

import crypto from 'crypto'
import {
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server'
import { User } from '@prisma/client'
import prisma from '@lib/database'

async function clean(str: string) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function generateChallenge(): Promise<string> {
  return clean(crypto.randomBytes(32).toString('base64'))
}

export async function binaryToBase64url(bytes: Uint8Array) {
  let str = ''

  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode)
  })

  return btoa(str)
}

// eslint-disable-next-line import/prefer-default-export
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
