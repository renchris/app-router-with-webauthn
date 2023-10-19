'use client'

import { useRouter } from 'next/navigation'
import { clearCookies } from '@lib/cookieActions'

const LogoutButton = () => {
  const router = useRouter()
  async function logout() {
    await clearCookies()
    router.push('/')
  }
  return (
    <button type="button" onClick={logout}>
      Logout
    </button>
  )
}

export default LogoutButton
