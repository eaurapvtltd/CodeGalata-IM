import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const list = await prisma.activityLog.findMany({
      where: { collegeId },
      orderBy: { timestamp: 'desc' },
    });

    const formatted = list.map((log: any) => ({
      id: log.id,
      collegeId: log.collegeId,
      type: log.type,
      action: log.action,
      description: log.description,
      adminEmail: log.adminEmail,
      timestamp: log.timestamp.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    logger.error('Fetch activity logs error', err);
    return NextResponse.json({ error: err.message || 'Error fetching logs' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    await prisma.activityLog.deleteMany({
      where: { collegeId },
    });

    logger.info(`Cleared all activity logs for college: ${collegeId}`);

    return NextResponse.json({ success: true, message: 'Logs cleared successfully' });
  } catch (err: any) {
    logger.error('Clear activity logs error', err);
    return NextResponse.json({ error: err.message || 'Error clearing logs' }, { status: 500 });
  }
}
