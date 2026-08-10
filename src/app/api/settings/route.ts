// @ts-nocheck
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const settingsSchema = z.object({
  logoUrl: z.string().optional().nullable(),
  academicYear: z.string().min(1, 'Academic year is required'),
  defaultBranchId: z.string().optional().nullable(),
  defaultBatchId: z.string().optional().nullable(),
  notificationsEnabled: z.boolean().default(true),
  theme: z.enum(['Light', 'Dark', 'System']).default('Dark'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
    }

    let settings = await prisma.collegeSettings.findUnique({
      where: { collegeId },
    });

    if (!settings) {
      // Find first branch to set default if available
      const firstBranch = await prisma.branch.findFirst({
        where: { collegeId },
      });

      settings = await prisma.collegeSettings.create({
        data: {
          collegeId,
          academicYear: '2025-2026',
          defaultBranchId: firstBranch?.id || null,
          notificationsEnabled: true,
          theme: 'Dark',
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    logger.error(err, 'Error fetching settings');
    return NextResponse.json({ error: err.message || 'Error fetching settings' }, { status: 500 });
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
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const settings = await tx.collegeSettings.upsert({
        where: { collegeId },
        update: parsed.data,
        create: {
          collegeId,
          ...parsed.data,
        },
      });

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'settings',
          action: 'Settings Update',
          description: 'Updated college system preferences',
          adminEmail: 'admin@cgit.edu',
        },
      });

      return settings;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error(err, 'Error saving settings');
    return NextResponse.json({ error: err.message || 'Error saving settings' }, { status: 500 });
  }
}
