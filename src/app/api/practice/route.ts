// @ts-nocheck
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const practiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  durationMinutes: z.number().min(1),
  problemIds: z.array(z.string()).min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  batchId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const list = await prisma.timedPractice.findMany({
      where: { collegeId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = list.map((p) => ({
      id: p.id,
      collegeId: p.collegeId,
      title: p.title,
      durationMinutes: p.durationMinutes,
      problemIds: p.problemIds,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      batchId: p.batchId,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    logger.error(err, 'Error fetching timed practices');
    return NextResponse.json({ error: err.message || 'Error fetching timed practices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = practiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const newPractice = await prisma.$transaction(async (tx) => {
      const practice = await tx.timedPractice.create({
        data: {
          collegeId,
          title: parsed.data.title,
          durationMinutes: parsed.data.durationMinutes,
          problemIds: parsed.data.problemIds,
          startDate: new Date(parsed.data.startDate),
          endDate: new Date(parsed.data.endDate),
          batchId: parsed.data.batchId,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'practice',
          action: 'Practice Creation',
          description: `Created timed practice "${parsed.data.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return practice;
    });

    return NextResponse.json({ success: true, data: newPractice });
  } catch (err: any) {
    logger.error(err, 'Error creating timed practice');
    return NextResponse.json({ error: err.message || 'Error creating timed practice' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const id = searchParams.get('id');

    if (!collegeId || !id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.timedPractice.delete({
        where: { id },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'practice',
          action: 'Practice Deletion',
          description: 'Deleted timed practice session.',
          adminEmail: 'admin@cgit.edu',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Timed practice deleted successfully' });
  } catch (err: any) {
    logger.error(err, 'Error deleting practice session');
    return NextResponse.json({ error: err.message || 'Error deleting practice session' }, { status: 500 });
  }
}
