'use server'

import crypto from 'crypto'

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
