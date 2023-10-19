import { css } from '@styled-system/css'
import Link from 'next/link'

const Home = () => (
  <div className={css({ fontSize: '2xl', fontWeight: 'bold' })}>
    Hello 🐼!
    <h1>Next.js Webauthn Demo</h1>
    <ul>
      <li>
        <Link href="/register">Register</Link>
      </li>
      <li>
        <Link href="/login">Login</Link>
      </li>
      <li>
        <Link href="/admin">Admin (Authenticated Page) </Link>
      </li>
    </ul>
  </div>
)

export default Home
