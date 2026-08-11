import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
    }

    const college = await prisma.college.findUnique({
      where: { collegeEmail: email.toLowerCase() },
    });

    if (!college) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: college.id,
        collegeName: college.collegeName,
        collegeEmail: college.collegeEmail,
        password: college.password,
        createdAt: college.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    logger.error('Find college error', err);
    return NextResponse.json({ error: err.message || 'Error finding college' }, { status: 500 });
  }
}
