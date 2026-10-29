import { PrismaClient } from '@prisma/client'

// Singleton Prisma client. Avoids opening a new connection per request
// in dev mode (Next.js hot reloads module imports).
// In production (Vercel), each serverless function invocation gets a
// fresh client — Prisma handles connection pooling via Neon's pooler.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
