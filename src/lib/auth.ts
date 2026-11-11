// Auth.js / NextAuth v4 config — Google OAuth with Prisma adapter
// Reuses the User/Account/Session models from our Prisma schema.
import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'database', // Use the Session table — needed for serverless
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Attach the user id to the session so API routes can read it
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user, account }) {
      // On first sign-in, the PrismaAdapter creates a User record.
      // We also create a default UserPreferences row here so the
      // onboarding wizard has something to update.
      if (account?.provider === 'google' && user.id) {
        const existing = await db.userPreferences.findUnique({
          where: { userId: user.id },
        })
        if (!existing) {
          await db.userPreferences.create({
            data: { userId: user.id },
          })
        }
      }
      return true
    },
  },
  pages: {
    // No custom sign-in page — we use a button in the navbar that
    // redirects to /api/auth/signin. After sign-in, redirect to /onboarding
    // if profile is incomplete, else /dashboard.
    signIn: '/auth/signin',
  },
  secret: process.env.AUTH_SECRET,
}

export default NextAuth(authOptions)
