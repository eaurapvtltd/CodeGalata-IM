import { NextResponse } from 'next/server';
import { getCollegeDashboardStats } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    const stats = getCollegeDashboardStats(collegeId);
    return NextResponse.json({ success: true, data: stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching report stats' }, { status: 500 });
  }
}
