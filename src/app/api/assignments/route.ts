import { NextResponse } from 'next/server';
import { getAssignments, createAssignment } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    const list = getAssignments(collegeId);
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching assignments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collegeId, title, description, branchId, batchId, problemIds, dueDate, isPublished } = body;

    if (!collegeId || !title || !branchId || !batchId || !problemIds || !dueDate) {
      return NextResponse.json({ error: 'Missing required assignment fields' }, { status: 400 });
    }

    const created = createAssignment(collegeId, {
      title,
      description: description || '',
      branchId,
      batchId,
      problemIds,
      dueDate,
      isPublished: isPublished ?? true,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating assignment' }, { status: 500 });
  }
}
