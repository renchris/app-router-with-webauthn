'use server'

import { User } from '@prisma/client'
import getServerActionSession from '@lib/session'

export const authenticatedUserIdToCookieStorage = async (
  user: User,
) => {
  const session = await getServerActionSession()
  session.userId = user.id
  await session.save()
}

export const getRegisteredUserIdFromCookieStorage = async (): Promise<number | undefined> => {
  const session = await getServerActionSession()
  return session.userId
}

export const setChallengeToCookieStorage = async (challenge: string) => {
  const session = await getServerActionSession()
  session.challenge = challenge
  await session.save()
}

export const clearCookies = async () => {
  const session = await getServerActionSession()
  session.destroy()
}
