import { NextAuthOptions } from 'next-auth'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    // Add your authentication providers here
    // For now, we'll use a simple configuration
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      return token
    },
    async session({ session, token }) {
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/error',
  },
}