import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE, DEVELOPER_ACCESS_COOKIE } from '@/lib/constants';
import { readAdminSessionToken } from '@/lib/admin-session';
import { readDeveloperToken } from '@/lib/developer-access';

const adminOpenAccess = process.env.ADMIN_OPEN_ACCESS === '1';

async function hasSession(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(await readAdminSessionToken(cookie));
}

function isStaticAsset(pathname: string): boolean {
  const assetExt = /\.(png|svg|ico|jpg|jpeg|gif|webp|avif|css|js|txt|xml|json|map|woff2?|ttf|otf)$/i;
  return pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/media') || assetExt.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isApiRoute = pathname.startsWith('/api/admin');
  const isDeveloperAccessRoute = pathname.startsWith('/api/developer-access');
  const comingSoon = process.env.SITE_COMING_SOON === '1';
  if (comingSoon) {
    const allow = isStaticAsset(pathname) || pathname.startsWith('/coming-soon') || isAdminRoute || isApiRoute || isDeveloperAccessRoute;
    const developerAccess = await readDeveloperToken(request.cookies.get(DEVELOPER_ACCESS_COOKIE)?.value, 'access');
    if (!allow && !developerAccess) {
      return NextResponse.redirect(new URL('/coming-soon', request.url));
    }
  }

  if (!isAdminRoute && !isApiRoute) {
    return NextResponse.next();
  }

  if (adminOpenAccess) {
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  const loggedIn = await hasSession(request);
  const isLoginRoute = pathname === '/admin/login';

  if (isLoginRoute) {
    if (loggedIn) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!loggedIn) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('from', `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)']
};
