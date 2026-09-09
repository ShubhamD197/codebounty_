"use client";

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { UserRole } from '@prisma/client'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { CommandMenu } from './command-menu'
import { motion } from "motion/react"

const NAV_LINKS = [
  { href: "/patterns", label: "Patterns" },
  { href: "/problems", label: "Problems" },
  { href: "/playlists", label: "Playlists" },
  { href: "/profile", label: "Profile" },
];

const Navbar = ({ userRole }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // "/problems" must not light up while we are on "/problem/xyz".
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4"
    >
      <div className="bg-bg-surface/60 backdrop-blur-xl border border-border rounded-2xl shadow-2xl transition-all duration-300">
        <div className="px-4 sm:px-6 py-3 flex justify-between items-center gap-3">
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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <CommandMenu />

            <div className="h-4 w-px bg-border hidden sm:block"></div>

            <ModeToggle />

            <Show when="signed-in">
              {userRole && userRole === UserRole.ADMIN && (
                <Link href={"/create-problem"} className="hidden sm:block">
                  <Button variant={"outline"} size={"sm"} className="border-border hover:border-accent hover:bg-accent/10 transition-colors">
                    Admin
                  </Button>
                </Link>
              )}
              <UserButton />
            </Show>

            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2">
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
                    className="text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-all border-0"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </Show>

            {/* Below md the links above are hidden, so they need somewhere to go. */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="md:hidden"
                render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <nav className="flex flex-col gap-1 p-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-bg-elevated text-text-primary"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Show when="signed-in">
                    {userRole === UserRole.ADMIN && (
                      <Link
                        href="/create-problem"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      >
                        Admin
                      </Link>
                    )}
                  </Show>
                  <Show when="signed-out">
                    <SignInButton>
                      <Button variant="outline" className="mt-2 w-full">Log in</Button>
                    </SignInButton>
                    <SignUpButton>
                      <Button className="mt-2 w-full">Sign Up</Button>
                    </SignUpButton>
                  </Show>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
