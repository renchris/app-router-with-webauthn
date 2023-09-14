import {
  IronSessionOptions, getServerActionIronSession, IronSessionData,
} from 'iron-session'
import { cookies } from 'next/headers'

const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || '',
  cookieName: 'next-webauthn',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

declare module 'iron-session' {
  interface IronSessionData {
    userId?: number;
    challenge?: string;
    user?: {
      id: number
      name: string
    }
  }
}

const getServerActionSession = async () => {
  const session = getServerActionIronSession<IronSessionData>(sessionOptions, cookies())
  return session
}

export default getServerActionSession
