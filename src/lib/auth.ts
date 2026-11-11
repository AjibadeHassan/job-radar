// GigForMe — Auth.js (NextAuth v4) config with Google provider + Prisma adapter
// Multi-tenant: every user gets their own Profile, Resume, TelegramLink, etc.

import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'
import type { Role } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',  // JWT for serverless compatibility (no DB session lookups)
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: persist user.id and role to the token
      if (user) {
        token.uid = user.id
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        token.role = (dbUser?.role as Role) ?? 'USER'
      }
      return token
    },
    async session({ session, token }) {
      // Expose user.id and role on session.user
      if (session.user) {
        ;(session.user as any).id = token.uid
        ;(session.user as any).role = token.role
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Gate: only allow sign-in if GOOGLE_CLIENT_ID is set
      if (!process.env.GOOGLE_CLIENT_ID) {
        return false
      }
      return true
    },
  },
  pages: {
    signIn: '/',
    error: '/?auth_error=1',
  },
}

// Helper to fetch the current session on the server
import { getServerSession } from 'next-auth'
export async function getSession() {
  return getServerSession(authOptions)
}

// Helper to require auth on API routes — returns userId or 401
export async function requireAuth(): Promise<{ userId: string; email: string } | null> {
  const session = await getSession()
  if (!session?.user) return null
  return {
    userId: (session.user as any).id as string,
    email: session.user.email!,
  }
}
