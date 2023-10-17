'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supported, get } from '@github/webauthn-json'
import { useRouter } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'
import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types'
import { getAuthenticationOptionsJSON, loginProcess } from '@lib/login'

const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAvailability = async () => {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      setIsAvailable(available && supported())
    }

    checkAvailability()
  }, [])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const authenticationOptionsJSON = await getAuthenticationOptionsJSON(email)
      const { challenge } = authenticationOptionsJSON

      const authenticationResponse:
      AuthenticationResponseJSON = await
      startAuthentication(
        authenticationOptionsJSON,
      )

      // then later verifyAuthentication(userCredential, challenge, authenticationResponse)
      /**
      try {
        loginProcess(
          challenge,
          credential,
          email,
          authenticationResponse,
        )
      } catch (err) {
        const loginError = err as Error
        setError(loginError.message)
      }
       */

      // then later router.push('/page-of-auth-content')
      //   router.push('/admin')
    } catch (err) {
      const loginError = err as Error
      setError(loginError.message)
    }
  }

  return (
    isAvailable ? (
      <form method="POST" onSubmit={onSubmit}>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input type="submit" value="Login" />
        {error != null ? <pre>{error}</pre> : null}
      </form>
    ) : (
      <p>Sorry, webauthn is not available.</p>
    )
  )
}

export default Login
