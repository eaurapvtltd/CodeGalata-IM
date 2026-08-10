// @ts-nocheck
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  branchId: z.string().min(1, 'Branch ID is required'),
  batchId: z.string().min(1, 'Batch ID is required'),
  problemIds: z.array(z.string()).min(1, 'At least one problem is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  isPublished: z.boolean().default(true),
  marks: z.number().optional().nullable(),
  codeTag: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { collegeId },
      orderBy: { createdAt: 'desc' },
    });

    // Compute submission count for each assignment dynamically
    // An assignment is mapped to a batch. Students in that batch who submitted any of the assignment's problemIds.
    const list = await Promise.all(
      assignments.map(async (assign: any) => {
        // Find students in the batch
        const students = await prisma.student.findMany({
          where: { batchId: assign.batchId },
          select: { id: true },
        });
        const studentIds = students.map((s: any) => s.id);

        // Count unique students who submitted any problem in the assignment
        const submissionCount = await prisma.submission.groupBy({
          by: ['studentId'],
          where: {
            studentId: { in: studentIds },
            problemId: { in: assign.problemIds },
          },
        });

        return {
          ...assign,
          dueDate: assign.dueDate.toISOString(),
          createdAt: assign.createdAt.toISOString(),
          submissionCount: submissionCount.length,
        };
      })
    );

    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    logger.error(err, 'Error fetching assignments');
    return NextResponse.json({ error: err.message || 'Error fetching assignments' }, { status: 500 });
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
    const parsed = assignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const newAssignment = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          collegeId,
          ...parsed.data,
          dueDate: new Date(parsed.data.dueDate),
        },
      });

      // Log admin activity
      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'assignment',
          action: 'Assignment Creation',
          description: `Created assignment "${parsed.data.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return assignment;
    });

    return NextResponse.json({ success: true, data: newAssignment });
  } catch (err: any) {
    logger.error(err, 'Error creating assignment');
    return NextResponse.json({ error: err.message || 'Error creating assignment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const assignmentId = searchParams.get('assignmentId');

    if (!collegeId || !assignmentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = assignmentSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          ...parsed.data,
          dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'assignment',
          action: 'Assignment Update',
          description: `Updated assignment "${assignment.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return assignment;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error(err, 'Error updating assignment');
    return NextResponse.json({ error: err.message || 'Error updating assignment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const assignmentId = searchParams.get('assignmentId');

    if (!collegeId || !assignmentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.delete({
        where: { id: assignmentId },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'assignment',
          action: 'Assignment Deletion',
          description: `Deleted assignment "${assignment.title}"`,
          adminEmail: 'admin@cgit.edu',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err: any) {
    logger.error(err, 'Error deleting assignment');
    return NextResponse.json({ error: err.message || 'Error deleting assignment' }, { status: 500 });
  }
}
