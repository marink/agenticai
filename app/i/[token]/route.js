import { NextResponse } from 'next/server';
import { findInvite, INVITE_COOKIE, INVITE_MAX_AGE } from '@/lib/invite.js';

// Opening an invite link: set the cookie and land on the normal page. A bad token lands
// on the same page without it, so the link format gives nothing away. Either way the
// token leaves the address bar immediately.
export async function GET(req, { params }) {
  const { token } = await params;
  const label = findInvite(token);
  const res = NextResponse.redirect(new URL('/', req.url), 303);
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Referrer-Policy', 'no-referrer');
  if (label) {
    console.log(`invite opened: ${label}`);
    res.cookies.set(INVITE_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: INVITE_MAX_AGE,
    });
  }
  return res;
}
