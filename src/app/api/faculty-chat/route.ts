import { NextResponse } from 'next/server';
import { getCollegeFaculty, getFacultyChatMessages, sendFacultyChatMessage } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');
  const facultyId = searchParams.get('facultyId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    if (facultyId) {
      const messages = getFacultyChatMessages(collegeId, facultyId);
      return NextResponse.json({ success: true, data: messages });
    }

    const faculty = getCollegeFaculty(collegeId);
    return NextResponse.json({ success: true, data: faculty });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collegeId, facultyId, sender, senderName, text, referenceContext } = body;

    if (!collegeId || !facultyId || !sender || !text) {
      return NextResponse.json({ error: 'Missing required chat parameters' }, { status: 400 });
    }

    const created = sendFacultyChatMessage(collegeId, facultyId, {
      sender,
      senderName: senderName || (sender === 'admin' ? 'Super Admin' : 'Faculty Member'),
      text,
      referenceContext,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error sending chat message' }, { status: 500 });
  }
}
