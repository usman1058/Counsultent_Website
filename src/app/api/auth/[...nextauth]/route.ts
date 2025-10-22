import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const admin = await db.admin.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!admin) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: admin.id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always use relative redirects to work in any environment
      if (url.startsWith("/")) return url
      // If it's an absolute URL on the same origin, make it relative
      try {
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          return urlObj.pathname + urlObj.search + urlObj.hash
        }
      } catch {
        // If URL parsing fails, return relative dashboard URL
      }
      // Default to dashboard
      return "/admin/dashboard"
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }