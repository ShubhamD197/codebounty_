"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { UserRole } from "@prisma/client";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CommandMenu } from "./command-menu";

const NAV_LINKS = [
  { href: "/patterns", label: "Patterns" },
  { href: "/problems", label: "Problems" },
  { href: "/playlists", label: "Playlists" },
  { href: "/profile", label: "Profile" },
];

/**
 * A plain sticky bar, 56px tall, separated from the page by a single hairline.
 *
 * It was previously a floating pill: inset from the top, fully rounded, with a
 * blur halo behind the logo, a 2xl shadow and an entrance animation. It needed
 * 128px of clearance, which is why every page began so far down the viewport,
 * and it sat at a different width from the content beneath it, so nothing
 * aligned. A bar that shares the page's own gutters lines up with everything.
 */
const Navbar = ({ userRole }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // "/problems" must not light up while we are on "/problem/xyz".
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-base/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt=""
            width={22}
            height={22}
            className="dark:invert"
          />
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            CodeBounty
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                isActive(link.href)
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <CommandMenu />
          <ModeToggle />

          <Show when="signed-in">
            {userRole === UserRole.ADMIN && (
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="hidden sm:inline-flex"
                render={<Link href="/create-problem" />}
              >
                Admin
              </Button>
            )}
            <div className="ml-1 flex items-center">
              <UserButton />
            </div>
          </Show>

          <Show when="signed-out">
            <div className="hidden sm:flex items-center gap-1">
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </div>
          </Show>

          {/* Below md the links above are hidden, so they need somewhere to go. */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden"
              render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-60">
              <SheetTitle className="px-4 pt-4 text-sm">Menu</SheetTitle>
              <nav className="flex flex-col gap-0.5 p-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive(link.href)
                        ? "bg-bg-elevated text-text-primary"
                        : "text-text-muted hover:bg-bg-elevated hover:text-text-primary"
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
                      className="rounded-md px-3 py-2 text-sm text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                    >
                      Admin
                    </Link>
                  )}
                </Show>
                <Show when="signed-out">
                  <SignInButton>
                    <Button variant="outline" className="mt-2 w-full">
                      Log in
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button className="mt-1.5 w-full">Sign up</Button>
                  </SignUpButton>
                </Show>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
