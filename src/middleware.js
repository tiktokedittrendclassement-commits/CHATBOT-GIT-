import { NextResponse } from 'next/server'

export function middleware(request) {
    const { pathname } = request.nextUrl

    // 1. Skip paths that should always be accessible
    // - Maintenance page itself
    // - Public assets (images, fonts, etc.)
    // - API auth (to allow setting the preview cookie)
    // - _next internal files
    if (
        pathname.startsWith('/maintenance') ||
        pathname.includes('.') || // matches assets like favicon.ico, images, etc.
        pathname.startsWith('/api/auth/preview') ||
        pathname.startsWith('/_next')
    ) {
        return NextResponse.next()
    }

    // 2. Check for the preview key/cookie
    // We'll use a cookie named 'vendo_preview_access'
    const hasAccess = request.cookies.has('vendo_preview_access')

    // If not authorized, redirect to maintenance
    if (!hasAccess) {
        const maintenanceUrl = new URL('/maintenance', request.url)
        return NextResponse.redirect(maintenanceUrl)
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
