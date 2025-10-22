import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to login page without authentication
        if (pathname === '/admin/login') {
          return true
        }
        
        // Require authentication for all other admin routes
        return !!token
      }
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}