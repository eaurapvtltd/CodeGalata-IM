import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const studentUploadSchema = z.object({
  collegeId: z.string().min(1),
  batchId: z.string().min(1),
  students: z.array(
    z.object({
      studentName: z.string().min(1),
      cgpa: z.number().default(0.0),
      email: z.string().email(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = studentUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { collegeId, batchId, students } = parsed.data;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: 'College not found.' }, { status: 404 });
    }

    const createdStudents = await prisma.$transaction(async (tx: any) => {
      const results = [];
      for (const st of students) {
        const existing = await tx.student.findUnique({
          where: { email: st.email.toLowerCase() },
        });

        if (existing) {
          continue;
        }

        const student = await tx.student.create({
          data: {
            batchId,
            studentName: st.studentName,
            cgpa: st.cgpa,
            email: st.email.toLowerCase(),
            status: 'Activated',
            rollNo: 'REG' + Math.floor(100000 + Math.random() * 900000),
            phone: '9' + Math.floor(100000000 + Math.random() * 900000000),
            registeredOn: new Date().toLocaleString(),
            lastActive: 'Just registered',
            attendancePct: 90.0,
          },
        });
        results.push(student);
      }

      await tx.activityLog.create({
        data: {
          collegeId,
          type: 'student',
          action: 'Student Upload',
          description: `Uploaded ${results.length} students to batch`,
          adminEmail: 'admin@cgit.edu',
        },
      });

      await tx.activity.create({
        data: {
          collegeId,
          type: 'students_uploaded',
          description: `Uploaded ${results.length} students to batch`,
        },
      });

      return results;
    });

    logger.info(`Successfully imported ${createdStudents.length} students to batch ${batchId}`);

    return NextResponse.json({ success: true, data: createdStudents });
  } catch (err: any) {
    logger.error(err, 'Bulk student import error');
    return NextResponse.json({ error: err.message || 'Error uploading students' }, { status: 500 });
  }
}
