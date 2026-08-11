import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const createBatchSchema = z.object({
  collegeId: z.string().min(1, 'College ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  batchName: z.string().min(1, 'Batch name is required'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const collegeId = searchParams.get('collegeId');

    if (branchId) {
      const list = await prisma.batch.findMany({
        where: { branchId },
        orderBy: { batchName: 'asc' },
      });
      return NextResponse.json({ success: true, data: list });
    }

    if (collegeId) {
      const branches = await prisma.branch.findMany({
        where: { collegeId },
      });
      const branchIds = branches.map((b: any) => b.id);
      
      const list = await prisma.batch.findMany({
        where: { branchId: { in: branchIds } },
        orderBy: { batchName: 'asc' },
      });
      return NextResponse.json({ success: true, data: list });
    }

    return NextResponse.json({ error: 'Missing branchId or collegeId parameter' }, { status: 400 });
  } catch (err: any) {
    logger.error(err, 'Error fetching batches');
    return NextResponse.json({ error: err.message || 'Error fetching batches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { collegeId, branchId, batchName } = parsed.data;

    const existing = await prisma.batch.findFirst({
      where: {
        branchId,
        batchName: { equals: batchName.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Batch "${batchName}" already exists in this branch.` }, { status: 409 });
    }

    const newBatch = await prisma.$transaction(async (tx: any) => {
      const batch = await tx.batch.create({
        data: {
          branchId,
          batchName: batchName.trim(),
        },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'batch',
          action: 'Batch Creation',
          description: `Created batch ${batchName.trim()}`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      await tx.activity.create({
        data: {
          collegeId,
          type: 'batch_created',
          description: `Created batch ${batchName.trim()} in branch`,
        },
      });

      return batch;
    });

    return NextResponse.json({ success: true, data: newBatch });
  } catch (err: any) {
    logger.error(err, 'Error creating batch');
    return NextResponse.json({ error: err.message || 'Error creating batch' }, { status: 500 });
  }
}
