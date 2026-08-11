import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const college = await prisma.college.findUnique({
      where: { collegeEmail: email.toLowerCase() },
    });

    if (!college) {
      return NextResponse.json({ error: 'No college registered with this email.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, college.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const tokenPayload = { collegeId: college.id, email: college.collegeEmail };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      data: {
        id: college.id,
        collegeName: college.collegeName,
        collegeEmail: college.collegeEmail,
        createdAt: college.createdAt,
      },
    });

    const isProd = process.env.NODE_ENV === 'production';
    
    response.cookies.set('cg_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    response.cookies.set('cg_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    await prisma.activityLog.create({
      data: {
        collegeId: college.id,
        type: 'auth',
        action: 'Login',
        description: 'Admin logged in',
        adminEmail: college.collegeEmail,
      },
    });

    logger.info(`Successful login for college: ${college.collegeName} (${email})`);

    return response;
  } catch (err: any) {
    logger.error(err, 'Login API Error');
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
