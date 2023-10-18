'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supported, get } from '@github/webauthn-json'
import { useRouter } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'
import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types'
import { getAuthenticationOptionsJSON, loginUser } from '@lib/login'
import { authenticatedUserIdToCookieStorage } from '@lib/cookieActions'

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

      // using startAuthentication instead of .get() for our get navigator credentials,
      // we have authenticationResponse.id: Base64URLString to be the credential.id

      try {
        const user = await
        loginUser(
          challenge,
          email,
          authenticationResponse,
        )

        if (user instanceof Error) {
          setError(user.message ? user.message : 'An unknown Login error occurred')
          throw user
        }

        authenticatedUserIdToCookieStorage(user)
        router.push('/admin')
      } catch (err) {
        const loginError = err as Error
        setError(loginError.message)
      }
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
