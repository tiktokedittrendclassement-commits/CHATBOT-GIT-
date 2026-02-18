import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // In production, this should be in an environment variable
    // For now, let's use a default secret that the user can change
    const SECRET_KEY = process.env.PREVIEW_SECRET || 'vendo_secret_2024'

    if (token === SECRET_KEY) {
        const response = NextResponse.redirect(new URL('/', request.url))

        // Set cookie to expire in 30 days
        response.cookies.set('vendo_preview_access', 'true', {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        return response
    }

    return new NextResponse('Accès refusé', { status: 403 })
}
