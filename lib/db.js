import { PrismaClient } from '@prisma/client'

// globalThis is a global object available throughout the Node.js application.
// We use it to store a single Prisma instance and reuse it during development.
const globalForPrisma = globalThis

// Check if a Prisma instance already exists on the global object.
// If it exists, reuse it.
// Otherwise, create a new PrismaClient instance.
export const db = globalForPrisma.prisma || new PrismaClient()

// In development mode, Next.js reloads files frequently (Hot Reloading).
// Without this, every reload would create a new database connection.
//
// So we save the Prisma instance globally and reuse it on future reloads.
//
// We don't do this in production because production doesn't constantly reload files.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}