import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const contestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  problemIds: z.array(z.string()).min(1, 'At least one problem is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  batchId: z.string().min(1, 'Batch ID is required'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const contests = await prisma.contest.findMany({
      where: { collegeId },
      orderBy: { startTime: 'desc' },
    });

    const now = new Date().getTime();

    const list = contests.map((c: any) => {
      const start = new Date(c.startTime).getTime();
      const end = new Date(c.endTime).getTime();
      
      let status: 'Upcoming' | 'Running' | 'Completed' = 'Upcoming';
      if (now >= start && now <= end) {
        status = 'Running';
      } else if (now > end) {
        status = 'Completed';
      }

      return {
        ...c,
        startTime: c.startTime.toISOString(),
        endTime: c.endTime.toISOString(),
        createdAt: c.createdAt.toISOString(),
        status,
      };
    });

    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    logger.error(err, 'Error fetching contests');
    return NextResponse.json({ error: err.message || 'Error fetching contests' }, { status: 500 });
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
    const parsed = contestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const newContest = await prisma.$transaction(async (tx: any) => {
      const contest = await tx.contest.create({
        data: {
          collegeId,
          title: parsed.data.title,
          description: parsed.data.description,
          startTime: new Date(parsed.data.startTime),
          endTime: new Date(parsed.data.endTime),
          problemIds: parsed.data.problemIds,
          branchId: parsed.data.branchId,
          batchId: parsed.data.batchId,
        },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'contest',
          action: 'Contest Creation',
          description: `Created contest "${parsed.data.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return contest;
    });

    return NextResponse.json({ success: true, data: newContest });
  } catch (err: any) {
    logger.error(err, 'Error creating contest');
    return NextResponse.json({ error: err.message || 'Error creating contest' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const contestId = searchParams.get('contestId');

    if (!collegeId || !contestId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = contestSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const contest = await tx.contest.update({
        where: { id: contestId },
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : undefined,
          endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : undefined,
          problemIds: parsed.data.problemIds,
          branchId: parsed.data.branchId,
          batchId: parsed.data.batchId,
        },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'contest',
          action: 'Contest Update',
          description: `Updated contest "${contest.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return contest;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error(err, 'Error updating contest');
    return NextResponse.json({ error: err.message || 'Error updating contest' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const contestId = searchParams.get('contestId');

    if (!collegeId || !contestId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await prisma.$transaction(async (tx: any) => {
      const contest = await tx.contest.delete({
        where: { id: contestId },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'contest',
          action: 'Contest Deletion',
          description: `Deleted contest "${contest.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Contest deleted successfully' });
  } catch (err: any) {
    logger.error(err, 'Error deleting contest');
    return NextResponse.json({ error: err.message || 'Error deleting contest' }, { status: 500 });
  }
}
