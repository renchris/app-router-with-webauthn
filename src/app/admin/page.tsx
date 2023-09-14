'use server'

import { getRegisteredUserIdFromCookieStorage } from '@app/serverActions'

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
      <form method="POST" action="/api/auth/logout">
        <button type="submit">Logout</button>
      </form>
    </>
  )
}

export default Admin
