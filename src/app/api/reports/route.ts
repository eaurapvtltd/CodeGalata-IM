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

    const branches = await prisma.branch.findMany({
      where: { collegeId },
    });
    const branchIds = branches.map((b: any) => b.id);

    const batches = await prisma.batch.findMany({
      where: { branchId: { in: branchIds } },
    });
    const batchIds = batches.map((b: any) => b.id);

    const students = await prisma.student.findMany({
      where: { batchId: { in: batchIds } },
    });

    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => s.status === 'Activated').length;
    const studentsWorking = students.filter((s: any) => s.status === 'Working').length;
    const notActivatedStudents = students.filter((s: any) => s.status === 'Not Activated').length;

    const statusDistribution = [
      { name: 'Not Activated', value: notActivatedStudents, color: '#f59e0b' },
      { name: 'Active Students', value: activeStudents, color: '#10b981' },
      { name: 'Students Working', value: studentsWorking, color: '#3b82f6' },
    ];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activityTrend = days.map((day: any, idx: number) => ({
      day,
      students: Math.max(0, Math.round(totalStudents * (0.3 + idx * 0.1))),
      submissions: Math.max(0, Math.round(totalStudents * (0.8 + idx * 0.2))),
    }));

    const branchDistribution = await Promise.all(
      branches.map(async (branch: any) => {
        const bBatches = batches.filter((b: any) => b.branchId === branch.id);
        const bBatchIds = bBatches.map((b: any) => b.id);
        const bStudentsCount = students.filter((s: any) => bBatchIds.includes(s.batchId)).length;
        
        return {
          branch: branch.branchName,
          students: bStudentsCount,
          batches: bBatches.length,
        };
      })
    );

    const recentActivities = await prisma.activity.findMany({
      where: { collegeId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    const formattedActivities = recentActivities.map((act: any) => ({
      id: act.id,
      collegeId: act.collegeId,
      type: act.type,
      description: act.description,
      timestamp: act.timestamp.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        studentsWorking,
        statusDistribution,
        activityTrend,
        branchDistribution,
        recentActivities: formattedActivities,
      },
    });
  } catch (err: any) {
    logger.error('Fetch dashboard stats error', err);
    return NextResponse.json({ error: err.message || 'Error fetching dashboard stats' }, { status: 500 });
  }
}
