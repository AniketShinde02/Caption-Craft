import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Block setup access for authenticated admins - enforce strict protocol
  if (pathname === '/setup') {
    try {
      const token = await getToken({ req: request });
      
      // If user has admin role, redirect to admin dashboard
      if (token?.role?.name === 'admin') {
        const adminUrl = new URL('/admin/dashboard', request.url);
        return NextResponse.redirect(adminUrl);
      }
      
      // Allow non-admin users to access setup
      return NextResponse.next();
    } catch (error) {
      // If token verification fails, allow access to setup
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/setup']
};
