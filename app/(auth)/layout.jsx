import React from 'react'

const AuthLayout = ({ children }) => {
    return (
        <main className="h-screen flex flex-col justify-center items-center">
            {children}
        </main>
    )
}

export default AuthLayout