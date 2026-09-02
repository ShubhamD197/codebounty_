"use client";

import { Button } from '@/components/ui/button'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { UserRole } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { CommandMenu } from './command-menu'
import { motion } from "motion/react"

const Navbar = ({ userRole }) => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4"
    >
      <div className="bg-bg-surface/60 backdrop-blur-xl border border-border rounded-2xl shadow-2xl transition-all duration-300">
        <div className="px-6 py-3 flex justify-between items-center">
          <Link href={"/"} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-md rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Image src="/logo.svg"
                alt="CodeBounty"
                width={36}
                height={36}
                className="dark:invert relative z-10" />
            </div>
            <span className="font-bold text-xl tracking-wide text-text-primary">
              CodeBounty
            </span>
          </Link>

          <div className="hidden md:flex flex-row items-center justify-center gap-x-6">
            <Link
              href="/problems"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Problems
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <CommandMenu />
            
            <div className="h-4 w-px bg-border hidden sm:block"></div>

            <Show when="signed-in">
              {userRole && userRole === UserRole.ADMIN && (
                <Link href={"/create-problem"}>
                  <Button variant={"outline"} size={"sm"} className="border-border hover:border-accent hover:bg-accent/10 transition-colors">
                    Admin
                  </Button>
                </Link>
              )}
              <UserButton />
            </Show>

            <Show when="signed-out">
              <div className="flex items-center gap-2">
                <SignInButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    Log in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    size="sm"
                    className="text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(167,139,250,0.5)] border-0"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar