'use server'

import {
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server'
import {
  type User, type Credential, user as drizzleUser, credential,
} from 'drizzle/schema'
import db from 'drizzle/db'
import { eq } from 'drizzle-orm'
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

  const existingUser = db
    .select()
    .from(drizzleUser)
    .where(eq(drizzleUser.email, email))
    .prepare()
    .get()

  if (!existingUser) {
    const user = db
      .insert(drizzleUser)
      .values({
        email,
        username,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .prepare()
      .get()

    const insertCredentialStatementQuery = db
      .insert(credential)
      .values({
        userID: user.id,
        externalID: await clean(await binaryToBase64url(credentialID)),
        publicKey: Buffer.from(credentialPublicKey),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

    insertCredentialStatementQuery.run()

    console.log(`Registered new user ${user.id}`)
    return user
  }
  throw new Error('User with this email already exists')
}

export async function getUserFromEmail(email: string): Promise<User | Error> {
  const existingUser = db
    .select()
    .from(drizzleUser)
    .where(eq(drizzleUser.email, email))
    .prepare()
    .get()

  if (!existingUser) {
    throw new Error('User with this email does not exist')
  }
  return existingUser
}

export async function getCredentialsOfUser(user: User): Promise<Credential[] | Error> {
  try {
    const userID = user.id
    const credentials = db
      .select()
      .from(credential)
      .where(eq(credential.userID, userID))
      .prepare()
      .all()

    if (credentials.length === 0) {
      throw new Error('No credentials found for the user')
    }

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
    const updatedCredential = db
      .update(credential)
      .set({
        signCount: newSignCount,
      })
      .where(
        eq(credential.externalID, credentialIdToUpdate),
      )
      .returning()
      .prepare()
      .get()

    console.log('Updated Credential:', updatedCredential)
  } catch (error) {
    console.error('Error updating Credential:', error)
  }
}
