'use server'

import {
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  VerifiedAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'
import {
  AuthenticationResponseJSON,
  AuthenticatorDevice,
} from '@simplewebauthn/typescript-types'
import { Credential } from '@prisma/client'
import { updateCredentialSignCount } from '@lib/database'
import { clearCookies } from '@lib/cookieActions'
import { base64urlToBuffer } from '@lib/auth'

// eslint-disable-next-line import/prefer-default-export
export const verifyAuthentication = async ( // login
  userCredential: Credential,
  challenge: string,
  authenticationResponse: AuthenticationResponseJSON,
): Promise<VerifiedAuthenticationResponse> => {
  let verification: VerifiedAuthenticationResponse

  // const responseCredIDBuffer = await base64urlToBuffer(authenticationResponse.rawId)
  // let dbAuthenticator: AuthenticatorDevice | undefined
  // let matchedCredential: Credential | undefined

  const dbAuthenticator: AuthenticatorDevice = {
    credentialID: await base64urlToBuffer(userCredential.externalId),
    credentialPublicKey: userCredential.publicKey,
    counter: userCredential.signCount,
  }

  // userCredentials.forEach((credential) => {
  //   if (Uint8ArraysAreEqual(credential.publicKey, responseCredIDBuffer)) {
  //     dbAuthenticator = {
  //       credentialID: await base64urlToBuffer(credential.externalId),
  //       credentialPublicKey: credential.publicKey,
  //       counter: credential.signCount,
  //     }
  //     matchedCredential = credential
  //   }
  // })

  if (!dbAuthenticator) {
    throw new Error('Authenticator is not registered with this site')
  }

  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: authenticationResponse,
      expectedChallenge: challenge,
      expectedOrigin: 'https://localhost',
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
    // Update the authenticator's counter in the DB to the newest count in the authentication
    updateCredentialSignCount(userCredential.externalId, authenticationInfo.newCounter)
  }

  await clearCookies()

  return verification
}
