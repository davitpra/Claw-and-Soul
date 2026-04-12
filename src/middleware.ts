import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar si hay token de acceso en las cookies
  const accessToken = request.cookies.get('accessToken');

  // Si no hay token, redirigir a login
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);

    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Si hay token, permitir el acceso
  return NextResponse.next();
}

// Configurar qué rutas proteger
export const config = {
  matcher: [
    '/user/:path*', // Proteger área de usuario
  ],
};
