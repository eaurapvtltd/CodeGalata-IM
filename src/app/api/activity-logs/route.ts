import { NextResponse } from 'next/server';
import { getActivityLogs, clearActivityLogs } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    const logs = getActivityLogs(collegeId);
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching audit logs' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    clearActivityLogs(collegeId);
    return NextResponse.json({ success: true, message: 'Logs cleared successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error clearing audit logs' }, { status: 500 });
  }
}
