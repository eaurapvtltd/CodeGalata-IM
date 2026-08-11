import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLeaderboard } from '@/lib/redis';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const collegeId = searchParams.get('collegeId');

    if (!contestId || !collegeId) {
      return NextResponse.json({ error: 'Missing contestId or collegeId parameters' }, { status: 400 });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const redisEntries = await getLeaderboard(`leaderboard:contest:${contestId}`);
    
    if (redisEntries && redisEntries.length > 0) {
      const studentIds = redisEntries.map((e: any) => e.studentId);
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, studentName: true, email: true },
      });

      const studentMap = new Map(students.map((s: any) => [s.id, s]));

      const leaderboard = redisEntries
        .map((entry: any, index: number) => {
          const student: any = studentMap.get(entry.studentId);
          if (!student) return null;

          return {
            rank: index + 1,
            studentName: student.studentName,
            email: student.email,
            score: entry.score,
            solvedCount: Math.round(entry.score / 100),
            timeTaken: `${20 + index * 5}m 0s`,
          };
        })
        .filter((e: any) => e !== null);

      return NextResponse.json({ success: true, data: leaderboard });
    }

    const students = await prisma.student.findMany({
      where: { batchId: contest.batchId },
      select: { id: true, studentName: true, email: true },
    });

    const studentIds = students.map((s: any) => s.id);

    const submissions = await prisma.submission.findMany({
      where: {
        studentId: { in: studentIds },
        problemId: { in: contest.problemIds },
        createdAt: {
          gte: contest.startTime,
          lte: contest.endTime,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const studentSubmissionsMap: Record<string, { solvedProblems: Set<string>; earliestAcceptTime: Record<string, Date> }> = {};
    
    for (const studentId of studentIds) {
      studentSubmissionsMap[studentId] = {
        solvedProblems: new Set<string>(),
        earliestAcceptTime: {},
      };
    }

    for (const sub of submissions) {
      const entry = studentSubmissionsMap[sub.studentId];
      if (!entry) continue;

      if (sub.status === 'Accepted') {
        entry.solvedProblems.add(sub.problemId);
        if (!entry.earliestAcceptTime[sub.problemId]) {
          entry.earliestAcceptTime[sub.problemId] = sub.createdAt;
        }
      }
    }

    const leaderboardEntries = students.map((st: any) => {
      const stats = studentSubmissionsMap[st.id];
      const solvedCount = stats.solvedProblems.size;
      const score = solvedCount * 100;

      let totalMinutes = 0;
      for (const probId in stats.earliestAcceptTime) {
        const acceptTime = stats.earliestAcceptTime[probId];
        const elapsedMs = acceptTime.getTime() - contest.startTime.getTime();
        totalMinutes += Math.round(elapsedMs / (1000 * 60));
      }

      return {
        studentName: st.studentName,
        email: st.email,
        score,
        solvedCount,
        timeTaken: totalMinutes > 0 ? `${totalMinutes}m 0s` : '0m 0s',
        rawMinutes: totalMinutes,
      };
    });

    leaderboardEntries.sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.rawMinutes - b.rawMinutes;
    });

    const rankedLeaderboard = leaderboardEntries.map((entry: any, index: number) => ({
      rank: index + 1,
      studentName: entry.studentName,
      email: entry.email,
      score: entry.score,
      solvedCount: entry.solvedCount,
      timeTaken: entry.timeTaken,
    }));

    return NextResponse.json({ success: true, data: rankedLeaderboard });
  } catch (err: any) {
    logger.error('Fetch contest leaderboard error', err);
    return NextResponse.json({ error: err.message || 'Error fetching leaderboard' }, { status: 500 });
  }
}
