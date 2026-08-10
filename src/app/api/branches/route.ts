// @ts-nocheck
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const createBranchSchema = z.object({
  collegeId: z.string().min(1, 'College ID is required'),
  branchName: z.string().min(1, 'Branch name is required'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const list = await prisma.branch.findMany({
      where: { collegeId },
      orderBy: { branchName: 'asc' },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    logger.error(err, 'Error fetching branches');
    return NextResponse.json({ error: err.message || 'Error fetching branches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBranchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { collegeId, branchName } = parsed.data;

    // Check if branch name already exists for this college
    const existing = await prisma.branch.findFirst({
      where: {
        collegeId,
        branchName: { equals: branchName.trim(), mode: 'insensitive' },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Branch "${branchName}" already exists for your college.` }, { status: 409 });
    }

    const newBranch = await prisma.$transaction(async (tx) => {
      const branch = await tx.branch.create({
        data: {
          collegeId,
          branchName: branchName.trim(),
        },
      });

      // Log admin activity
      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'batch',
          action: 'Branch Creation',
          description: `Created new department "${branchName.trim()}"`,
          adminEmail: 'admin@cgit.edu', // fallback or lookup
        },
      });

      return branch;
    });

    return NextResponse.json({ success: true, data: newBranch });
  } catch (err: any) {
    logger.error(err, 'Error creating branch');
    return NextResponse.json({ error: err.message || 'Error creating branch' }, { status: 500 });
  }
}
