'use server'

import { getRegistrationOptions, verifyRegistration } from '@app/actions'
import RegisterPage from 'src/components/RegisterPage'

const Register = () => (
  <>
    <h1>Register Account</h1>
    <RegisterPage
      getRegistrationOptions={getRegistrationOptions}
      verifyRegistration={verifyRegistration}
    />
  </>
)

export default Register
