import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const facultySchema = z.object({
  collegeId: z.string().min(1, 'College ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().default('Faculty'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    const list = await prisma.facultyMember.findMany({
      where: { collegeId },
      orderBy: { name: 'asc' },
    });

    const enrichedList = await Promise.all(
      list.map(async (f: any) => {
        const unreadCount = await prisma.facultyChatMessage.count({
          where: {
            facultyId: f.id,
            isRead: false,
            sender: 'faculty',
          },
        });

        return {
          ...f,
          createdAt: f.createdAt.toISOString(),
          lastSeen: f.lastSeen?.toISOString() || null,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: enrichedList });
  } catch (err: any) {
    logger.error(err, 'Error fetching faculty list');
    return NextResponse.json({ error: err.message || 'Error fetching faculty list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = facultySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { collegeId, name, email, department, designation } = parsed.data;

    const existing = await prisma.facultyMember.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: `Faculty member with email "${email}" is already registered.` }, { status: 409 });
    }

    const newFaculty = await prisma.$transaction(async (tx: any) => {
      const faculty = await tx.facultyMember.create({
        data: {
          collegeId,
          name,
          email: email.toLowerCase(),
          department,
          designation,
          status: 'online',
        },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'settings',
          action: 'Faculty Registration',
          description: `Registered new faculty member ${name} (${department})`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      return faculty;
    });

    return NextResponse.json({ success: true, data: newFaculty });
  } catch (err: any) {
    logger.error(err, 'Error onboarding faculty');
    return NextResponse.json({ error: err.message || 'Error onboarding faculty' }, { status: 500 });
  }
}
