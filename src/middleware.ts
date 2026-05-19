import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getJwtRole(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded?.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    const role = getJwtRole(accessToken.value);
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/admin/:path*',
  ],
};
