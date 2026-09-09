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
          fontFamily: "var(--font-inter), sans-serif",
          borderRadius: "0.5rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
