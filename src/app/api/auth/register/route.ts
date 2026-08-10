// @ts-nocheck
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const registerSchema = z.object({
  collegeName: z.string().min(1, 'College name is required'),
  collegeEmail: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const STATIC_BRANCHES = ['CSE', 'AI', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { collegeName, collegeEmail, password } = parsed.data;

    // Check if college email is already in use
    const existingCollege = await prisma.college.findUnique({
      where: { collegeEmail: collegeEmail.toLowerCase() },
    });

    if (existingCollege) {
      return NextResponse.json({ error: 'A college with this email is already registered.' }, { status: 409 });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create college and seed default branches
    const newCollege = await prisma.$transaction(async (tx) => {
      const college = await tx.college.create({
        data: {
          collegeName,
          collegeEmail: collegeEmail.toLowerCase(),
          password: hashedPassword,
        },
      });

      // Create static branches
      const branchPromises = STATIC_BRANCHES.map((bName) =>
        tx.branch.create({
          data: {
            collegeId: college.id,
            branchName: bName,
          },
        })
      );

      await Promise.all(branchPromises);

      // Create default settings
      await tx.collegeSettings.create({
        data: {
          collegeId: college.id,
          academicYear: '2025-2026',
          notificationsEnabled: true,
          theme: 'Dark',
        },
      });

      // Create activity logs
      await tx.activityLog.create({
        data: {
          collegeId: college.id,
          type: 'auth',
          action: 'Registration',
          description: `College account "${collegeName}" registered.`,
          adminEmail: collegeEmail.toLowerCase(),
        },
      });

      return college;
    });

    logger.info(`Successfully registered college: ${collegeName} (${collegeEmail})`);

    return NextResponse.json({
      success: true,
      data: {
        id: newCollege.id,
        collegeName: newCollege.collegeName,
        collegeEmail: newCollege.collegeEmail,
        createdAt: newCollege.createdAt,
      },
    });
  } catch (err: any) {
    logger.error(err, 'Registration API Error');
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
