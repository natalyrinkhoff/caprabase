// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // 1. Core domains mapped directly inside your local development scope
  const allowedDomains = [
    'localhost:3000', 
    'caprabase.local:3000',
    'www.caprabase.local:3000'
  ];

  // 2. Skip framework assets, system API endpoints, and direct file requests
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 3. Evaluate if visitor is on the core platform or a tenant storefront
  const isBaseDomain = allowedDomains.some((domain) => hostname === domain);

  if (!isBaseDomain) {
    let tenantIdentifier = hostname;
    const hostWithoutPort = hostname.split(':')[0];

    // Check against both localhost and your custom local domain
    if (hostname.includes('localhost:3000') || hostname.includes('caprabase.local')) {
      tenantIdentifier = hostWithoutPort.split('.')[0];
    } else {
      // Handles standalone standalone custom domains (e.g., goatcheeseshop.com)
      tenantIdentifier = hostWithoutPort;
    }

    // Rewrite internally straight into your public route group folder
    return NextResponse.rewrite(new URL(`/site/${tenantIdentifier}${url.pathname}`, request.url));
  }

  // 4. Default execution path for core platform routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};