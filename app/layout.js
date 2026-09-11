import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkThemeProvider } from "@/components/providers/clerk-theme-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Self-hosted rather than pulled from onlinewebfonts' CDN: that would add a
// render-blocking stylesheet from a third party on every page, on a host we do
// not control. next/font/local inlines the @font-face, serves the file from our
// own origin, preloads it, and generates a metric-matched fallback so the swap
// causes no layout shift. See app/fonts/README.md for the licence position.
const segoe = localFont({
  src: "./fonts/segoe-regular.woff2",
  variable: "--font-segoe",
  // A single Regular cut ships; declaring it stops the browser inventing a
  // slant when italics are requested.
  weight: "400",
  style: "normal",
  display: "swap",
  // Plain family names only. next/font writes these straight into a
  // font-family list, so a var() here would not resolve. The full chain,
  // Inter included, is assembled in globals.css.
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata = {
  title: "CodeBounty",
  description: "CodeBounty",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} ${segoe.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkThemeProvider>
            <Toaster richColors closeButton />
            {children}
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}