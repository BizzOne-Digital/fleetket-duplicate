import { NextResponse, type NextRequest } from 'next/server'

// Optimistic gate only: bounce visitors with no session cookie before rendering.
// The real authorisation check (signature, user, role) happens in requireAdmin()/requireUser().
export function proxy(req: NextRequest) {
  if (!req.cookies.has('fk_session')) {
    const url = new URL('/login', req.url)
    url.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/account/:path*'] }
