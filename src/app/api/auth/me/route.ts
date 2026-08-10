import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('cg_access_token')?.value;

    let payload = accessToken ? verifyAccessToken(accessToken) : null;
    let response = null;

    if (!payload) {
      // Access token expired or missing, try refresh token
      const refreshToken = cookieStore.get('cg_refresh_token')?.value;
      const refreshPayload = refreshToken ? verifyRefreshToken(refreshToken) : null;

      if (!refreshPayload) {
        return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
      }

      // Generate new tokens
      const newTokenPayload = { collegeId: refreshPayload.collegeId, email: refreshPayload.email };
      const newAccessToken = signAccessToken(newTokenPayload);
      const newRefreshToken = signRefreshToken(newTokenPayload);

      payload = newTokenPayload;

      // Prepare response with refreshed cookies
      response = NextResponse.json({ success: true });
      const isProd = process.env.NODE_ENV === 'production';
      
      response.cookies.set('cg_access_token', newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });

      response.cookies.set('cg_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    const college = await prisma.college.findUnique({
      where: { id: payload.collegeId },
      select: {
        id: true,
        collegeName: true,
        collegeEmail: true,
        createdAt: true,
      },
    });

    if (!college) {
      return NextResponse.json({ error: 'College account not found' }, { status: 404 });
    }

    if (response) {
      // If we refreshed the tokens, send the user data in the refreshed response body
      return NextResponse.json({ success: true, data: college }, {
        headers: response.headers,
      });
    }

    return NextResponse.json({ success: true, data: college });
  } catch (err: any) {
    logger.error('Session retrieval error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
