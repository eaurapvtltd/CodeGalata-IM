import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Clear HTTP-only cookies by setting maxAge to 0
  response.cookies.set('cg_access_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('cg_refresh_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
