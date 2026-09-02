import React from 'react'
import { SignUp } from '@clerk/nextjs'
import { authAppearance } from '../../clerk-appearance'

const SignUpPage = () => {
    return (
        <SignUp appearance={authAppearance} />
    )
}

export default SignUpPage