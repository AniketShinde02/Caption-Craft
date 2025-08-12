import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Normalize pathname to handle trailing slashes
    const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
      ? pathname.slice(0, -1) 
      : pathname;
    
    // Always allow setup page to pass through (handle both with and without trailing slash)
    if (normalizedPath === '/admin/setup' || normalizedPath === '/setup') {
      return NextResponse.next();
    }

    // For all other routes, let NextAuth handle authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Normalize pathname to handle trailing slashes
        const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
          ? pathname.slice(0, -1) 
          : pathname;
        
        // Always allow setup page (handle both with and without trailing slash)
        if (normalizedPath === '/admin/setup' || normalizedPath === '/setup') {
          return true;
        }
        
        // For admin routes, require authentication
        if (normalizedPath.startsWith('/admin')) {
          return !!token;
        }
        
        // For other protected routes, require authentication
        return !!token;
      },
    },
    pages: { 
      signIn: '/setup', // Use the correct setup path
    },
  }
);

export const config = {
  matcher: [
    '/admin/dashboard',
    '/profile',
    '/settings',
    '/api/admin/dashboard-stats',
    '/api/user/:path*',
    '/api/posts/:path*'
  ]
};


