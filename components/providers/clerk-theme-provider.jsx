"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

/**
 * Clerk cannot read our CSS variables, so its baseTheme has to be handed to it
 * in JS. Previously only the sign-in and sign-up pages set one, and always to
 * dark - the UserButton in the navbar was left on Clerk's light default.
 */
export function ClerkThemeProvider({ children }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          // Clerk's own DOM sits outside our Tailwind classes, so it needs
          // the same stack spelled out or sign-in would be the one screen
          // still rendering in Inter.
          fontFamily: "var(--font-mayoze), var(--font-inter), sans-serif",
          borderRadius: "0.5rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
