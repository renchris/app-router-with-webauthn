'use server'

import { getRegisteredUserIdFromCookieStorage } from '@lib/cookieActions'
import Link from 'next/link'

async function getUserId(): Promise<number | string> {
  const userId = await getRegisteredUserIdFromCookieStorage()
  return userId || 'No User ID set in Cookie Storage'
}

const Admin = async () => {
  const userId = await getUserId()
  return (
    <>
      <h1>Admin</h1>
      <span>
        User ID:
        {' '}
        {userId}
      </span>
      <h2>
        <Link href="/">Back To Home Page</Link>
      </h2>
    </>
  )
}

export default Admin
