// @ts-nocheck
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const studentSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  studentName: z.string().min(1, 'Student name is required'),
  rollNo: z.string().min(1, 'Roll number is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  cgpa: z.number().min(0).max(10).default(0.0),
  status: z.enum(['Not Activated', 'Activated', 'Working']).default('Activated'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const batchId = searchParams.get('batchId');
    const collegeId = searchParams.get('collegeId');

    // 1. Fetch single student details with diagnostic analytics
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          batch: {
            include: {
              branch: true,
            },
          },
          submissions: {
            include: {
              problem: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!student) {
        return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
      }

      // Compute topic-level statistics
      // A mock/fallback breakdown as in original db.ts, merged with real submission status if any
      const submissionCount = student.submissions.length;
      const solvedCount = student.submissions.filter(s => s.status === 'Accepted').length;
      const accuracy = submissionCount > 0 ? Math.round((solvedCount / submissionCount) * 100) : 0;
      
      const defaultTopicStats = [
        { topic: 'Arrays & Hashing', total: 12, solved: solvedCount > 0 ? Math.min(12, solvedCount) : 0, accuracy: solvedCount > 0 ? 80.0 : 0.0, status: solvedCount > 0 ? 'Strong' : 'Weak' },
        { topic: 'Strings', total: 10, solved: 0, accuracy: 0.0, status: 'Weak' },
        { topic: 'Searching & Sorting', total: 8, solved: 0, accuracy: 0.0, status: 'Weak' },
        { topic: 'Binary Trees', total: 8, solved: 0, accuracy: 0.0, status: 'Weak' },
        { topic: 'Graph Theory', total: 10, solved: 0, accuracy: 0.0, status: 'Weak' },
        { topic: 'Dynamic Programming', total: 12, solved: 0, accuracy: 0.0, status: 'Weak' },
        { topic: 'Bit Manipulation', total: 5, solved: 0, accuracy: 0.0, status: 'Weak' },
      ];

      const weakPoints = defaultTopicStats.filter(t => t.status === 'Weak').map(t => t.topic);

      const submissionsHistory = student.submissions.map(sub => ({
        id: sub.id,
        problemTitle: sub.problem.title,
        topic: sub.problem.topics[0] || 'General',
        difficulty: sub.problem.difficulty,
        status: sub.status,
        score: sub.score,
        timeTaken: sub.executionTime ? `${sub.executionTime.toFixed(1)}ms` : '0ms',
        date: sub.createdAt.toISOString(),
      }));

      const extendedStudent = {
        ...student,
        solvedProblemsCount: student.solvedProblemsCount || solvedCount,
        totalQuestionsAttempted: student.totalQuestionsAttempted || submissionCount,
        accuracyPct: student.accuracyPct || accuracy,
        totalPoints: student.totalPoints || (solvedCount * 50),
        weakPoints: student.weakPoints.length > 0 ? student.weakPoints : weakPoints,
        topicStats: defaultTopicStats,
        submissionsHistory,
        activityLogs: [
          { action: 'Joined Batch & Completed Setup', timestamp: student.createdAt.toISOString() },
          ...student.submissions.slice(0, 5).map(sub => ({
            action: `Submitted ${sub.problem.title} (${sub.status})`,
            timestamp: sub.createdAt.toISOString(),
          })),
        ],
      };

      return NextResponse.json({ success: true, data: extendedStudent });
    }

    // 2. Fetch by batch ID
    if (batchId) {
      const list = await prisma.student.findMany({
        where: { batchId },
        orderBy: { studentName: 'asc' },
      });
      return NextResponse.json({ success: true, data: list });
    }

    // 3. Fetch all students for college
    if (collegeId) {
      const branches = await prisma.branch.findMany({
        where: { collegeId },
      });
      const branchIds = branches.map(b => b.id);
      const batches = await prisma.batch.findMany({
        where: { branchId: { in: branchIds } },
      });
      const batchIds = batches.map(b => b.id);

      const list = await prisma.student.findMany({
        where: { batchId: { in: batchIds } },
        orderBy: { studentName: 'asc' },
      });
      return NextResponse.json({ success: true, data: list });
    }

    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
  } catch (err: any) {
    logger.error(err, 'Error fetching students');
    return NextResponse.json({ error: err.message || 'Error fetching students' }, { status: 500 });
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
    const parsed = studentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { batchId, studentName, rollNo, email, phone, cgpa, status } = parsed.data;

    // Check duplicate email
    const existing = await prisma.student.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'A student with this email address already exists in the system.' }, { status: 409 });
    }

    const newStudent = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          batchId,
          studentName,
          rollNo,
          email: email.toLowerCase(),
          phone: phone || '9876543210',
          cgpa,
          status,
          registeredOn: new Date().toLocaleString(),
          lastActive: 'Just registered',
          attendancePct: 100.0,
        },
      });

      // Log admin activity
      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'student',
          action: 'Manual Student Onboarding',
          description: `Added student ${studentName} (${rollNo})`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return student;
    });

    return NextResponse.json({ success: true, data: newStudent });
  } catch (err: any) {
    logger.error(err, 'Error creating student');
    return NextResponse.json({ error: err.message || 'Error creating student' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const studentId = searchParams.get('studentId');

    if (!collegeId || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const body = await request.json();
    
    // Perform partial update
    const updated = await prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id: studentId },
        data: body,
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'student',
          action: 'Student Update',
          description: `Updated details for student ${student.studentName}`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return student;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error(err, 'Error updating student');
    return NextResponse.json({ error: err.message || 'Error updating student' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const studentId = searchParams.get('studentId');

    if (!collegeId || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const student = await tx.student.delete({
        where: { id: studentId },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'student',
          action: 'Student Deletion',
          description: `Deleted student ${student.studentName}`,
          adminEmail: 'admin@cgit.edu',
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (err: any) {
    logger.error(err, 'Error deleting student');
    return NextResponse.json({ error: err.message || 'Error deleting student' }, { status: 500 });
  }
}
