import React from 'react'
import { SignIn } from '@clerk/nextjs'
import { authAppearance } from '../../clerk-appearance'

const SignInPage = () => {
  return (
     <SignIn appearance={authAppearance} />
  )
}

export default SignInPage