import { NextResponse } from 'next/server';
import { getAllCollegeStudents, updateStudent, deleteStudent } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    const list = getAllCollegeStudents(collegeId);
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching students' }, { status: 500 });
  }
}
