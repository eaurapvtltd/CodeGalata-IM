// @ts-nocheck
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  languages: z.array(z.string()).default([]),
  defaultCode: z.record(z.string(), z.string()).optional().nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
  inputFormat: z.string().default('Standard Input'),
  outputFormat: z.string().default('Standard Output'),
  constraints: z.string().default(''),
  sampleInput: z.string().default(''),
  sampleOutput: z.string().default(''),
  explanation: z.string().default(''),
  hiddenTestCases: z.string().optional().nullable(),
  hints: z.array(z.string()).default([]),
  solutionTitle: z.string().optional().nullable(),
  solutionCode: z.string().optional().nullable(),
  timeComplexity: z.string().optional().nullable(),
  spaceComplexity: z.string().optional().nullable(),
  isSolutionPublic: z.boolean().default(true),
  companies: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  realWorldOutcome: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const list = await prisma.problem.findMany({
      where: { collegeId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    logger.error('Fetch problems error', err);
    return NextResponse.json({ error: err.message || 'Error fetching problems' }, { status: 500 });
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
    const parsed = problemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const newProblem = await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.create({
        data: {
          collegeId,
          ...parsed.data,
          defaultCode: (parsed.data.defaultCode || {}) as any,
        },
      });

      // Log admin activity
      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'problem',
          action: 'Problem Creation',
          description: `Created problem "${parsed.data.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      await tx.activity.create({
        data: {
          collegeId,
          type: 'problem_created',
          description: `Created problem "${parsed.data.title}"`,
        },
      });

      return problem;
    });

    return NextResponse.json({ success: true, data: newProblem });
  } catch (err: any) {
    logger.error(err, 'Create problem error');
    return NextResponse.json({ error: err.message || 'Error creating problem' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const problemId = searchParams.get('problemId');

    if (!collegeId || !problemId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = problemSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.update({
        where: { id: problemId },
        data: {
          ...parsed.data,
          defaultCode: (parsed.data.defaultCode || undefined) as any,
        },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'problem',
          action: 'Problem Update',
          description: `Updated problem "${problem.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      await tx.activity.create({
        data: {
          collegeId,
          type: 'problem_updated',
          description: `Updated problem "${problem.title}"`,
        },
      });

      return problem;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error(err, 'Update problem error');
    return NextResponse.json({ error: err.message || 'Error updating problem' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const problemId = searchParams.get('problemId');

    if (!collegeId || !problemId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.delete({
        where: { id: problemId },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'problem',
          action: 'Problem Deletion',
          description: `Deleted problem "${problem.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      await tx.activity.create({
        data: {
          collegeId,
          type: 'problem_deleted',
          description: `Deleted problem "${problem.title}"`,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Problem deleted successfully' });
  } catch (err: any) {
    logger.error(err, 'Delete problem error');
    return NextResponse.json({ error: err.message || 'Error deleting problem' }, { status: 500 });
  }
}
