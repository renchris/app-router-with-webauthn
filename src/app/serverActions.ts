'use server'

import { User } from '@prisma/client'
import getServerActionSession from '@lib/session'

// eslint-disable-next-line import/prefer-default-export
export const registeredUserIdToCookieStorage = async (
  user: User,
) => {
  const session = await getServerActionSession()
  session.userId = user.id
  await session.save()
}

// eslint-disable-next-line import/prefer-default-export
export const getRegisteredUserIdFromCookieStorage = async (): Promise<number | undefined> => {
  const session = await getServerActionSession()
  return session.userId
}
