'use client'

import {
  FormEvent,
  useEffect, useState,
} from 'react'
import { supported } from '@github/webauthn-json'
import { useRouter } from 'next/navigation'
import { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/typescript-types'
import { startRegistration } from '@simplewebauthn/browser'
import type { VerifiedRegistrationResponse } from '@simplewebauthn/server'
import Link from 'next/link'
import { registerUser } from '@lib/database'
import { registeredUserIdToCookieStorage } from '@lib/cookieActions'

const RegisterPage = ({ getRegistrationOptions, verifyRegistration }:
{
  getRegistrationOptions: (
    email: string,
    username: string,
  ) => Promise<PublicKeyCredentialCreationOptionsJSON>,
  verifyRegistration: (
    registrationResponse: RegistrationResponseJSON,
    challenge: string
  ) => Promise<VerifiedRegistrationResponse>
}) => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      setIsAvailable(available && supported())
    }
    checkAvailability()
  }, [])

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const creationOptionsJSON: PublicKeyCredentialCreationOptionsJSON = await
    getRegistrationOptions(
      email,
      username,
    )

    const registrationResponse: RegistrationResponseJSON = await
    startRegistration(
      creationOptionsJSON,
    )

    const verificationResponse: VerifiedRegistrationResponse = await
    verifyRegistration(
      registrationResponse,
      creationOptionsJSON.challenge,
    )

    try {
      const user = await
      registerUser(
        email,
        username,
        verificationResponse,
      )

      if (user instanceof Error) {
        setError(user.message ? user.message : 'An unknown error occurred')
        throw user
      }

      registeredUserIdToCookieStorage(user)
      router.push('/admin')
    } catch (err) {
      const registerError = err as Error
      setError(registerError.message)
    }
  }

  return (
    isAvailable ? (
      <form
        method="POST"
        onSubmit={handleFormSubmit}
      >
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input type="submit" value="Register" />
        {error != null ? <pre>{error}</pre> : null}
        {error === 'User with this email already exists' ? (
          <p>
            Please
            {' '}
            <Link href="/login"><b>sign in</b></Link>
            {' '}
            using your existing account credentials instead
          </p>
        ) : null}
      </form>
    ) : (
      <p>Sorry, webauthn is not available.</p>
    )
  )
}

export default RegisterPage
