import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle large request bodies for API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Set headers for larger payload handling
    const response = NextResponse.next();
    response.headers.set('Content-Length-Limit', '10485760'); // 10MB
    return response;
  }
  
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin token in cookies
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Simple token validation - just check if token exists and has basic structure
      // Full JWT verification will be done in API routes
      if (token.length < 10) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      // Allow access if token exists
      return NextResponse.next();
    } catch (error) {
      console.error('Invalid admin token:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check if the request is for admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Skip middleware for login API
    if (request.nextUrl.pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    // Check for admin token in Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    // Simple token validation - just check if token exists and has basic structure
    // Full JWT verification will be done in API routes
    if (token.length < 10) {
      return NextResponse.json(
        { error: 'Access denied. Invalid token.' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};