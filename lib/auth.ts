'use server'

import crypto from 'crypto'
import { Base64urlString } from '@github/webauthn-json/dist/types/base64url'

export async function clean(str: string) {
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

export async function base64urlToBuffer(base64urlString: Base64urlString): Promise<Buffer> {
  let padding = base64urlString.length % 4
  let modifiedBase64urlString = base64urlString

  if (padding !== 0) {
    padding = 4 - padding
    modifiedBase64urlString += '==='.slice(0, padding)
  }

  return Buffer.from(modifiedBase64urlString.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}
