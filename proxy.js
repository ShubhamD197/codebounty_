import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Protect a named list, rather than protecting everything and exempting
 * sign-in. The previous rule locked the landing page too, so a signed-out
 * visitor was bounced to sign-in before ever seeing what CodeBounty is, and the
 * navbar's signed-out state could never render.
 *
 * Browsing is public. Anything tied to a specific user is not. Solving is
 * public to read: the problem page's own actions check the session before they
 * run or record anything.
 */
const isProtectedRoute = createRouteMatcher([
    '/profile(.*)',
    '/playlists(.*)',
    '/dashboard(.*)',
    '/create-problem(.*)',
    '/api/create-problem(.*)',
])

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect()
    }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
