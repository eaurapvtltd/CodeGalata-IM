import { NextResponse } from 'next/server';
import { getContests, createContest } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    const list = getContests(collegeId);
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching contests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collegeId, title, description, startTime, endTime, problemIds, branchId, batchId } = body;

    if (!collegeId || !title || !startTime || !endTime || !problemIds || !branchId || !batchId) {
      return NextResponse.json({ error: 'Missing required contest fields' }, { status: 400 });
    }

    const created = createContest(collegeId, {
      title,
      description: description || '',
      startTime,
      endTime,
      problemIds,
      branchId,
      batchId,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error scheduling contest' }, { status: 500 });
  }
}
