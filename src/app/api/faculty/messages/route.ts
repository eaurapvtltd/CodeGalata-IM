import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const messageSchema = z.object({
  collegeId: z.string().min(1),
  facultyId: z.string().min(1),
  sender: z.enum(['admin', 'faculty']),
  senderName: z.string().min(1),
  text: z.string().min(1),
  referenceContext: z.object({
    type: z.enum(['contest', 'assignment', 'problem']),
    title: z.string(),
    id: z.string(),
  }).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const facultyId = searchParams.get('facultyId');

    if (!collegeId || !facultyId) {
      return NextResponse.json({ error: 'Missing collegeId or facultyId parameters' }, { status: 400 });
    }

    const list = await prisma.facultyChatMessage.findMany({
      where: { collegeId, facultyId },
      orderBy: { timestamp: 'asc' },
    });

    const formattedList = list.map((msg: any) => ({
      id: msg.id,
      collegeId: msg.collegeId,
      facultyId: msg.facultyId,
      sender: msg.sender,
      senderName: msg.senderName,
      text: msg.text,
      timestamp: msg.timestamp.toISOString(),
      isRead: msg.isRead,
      referenceContext: msg.referenceContextType && msg.referenceContextTitle && msg.referenceContextId ? {
        type: msg.referenceContextType,
        title: msg.referenceContextTitle,
        id: msg.referenceContextId,
      } : undefined,
    }));

    return NextResponse.json({ success: true, data: formattedList });
  } catch (err: any) {
    logger.error(err, 'Error fetching chat messages');
    return NextResponse.json({ error: err.message || 'Error fetching chat messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { collegeId, facultyId, sender, senderName, text, referenceContext } = parsed.data;

    const newMessage = await prisma.facultyChatMessage.create({
      data: {
        collegeId,
        facultyId,
        sender,
        senderName,
        text,
        isRead: sender === 'admin',
        referenceContextType: referenceContext?.type || null,
        referenceContextTitle: referenceContext?.title || null,
        referenceContextId: referenceContext?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newMessage.id,
        collegeId: newMessage.collegeId,
        facultyId: newMessage.facultyId,
        sender: newMessage.sender,
        senderName: newMessage.senderName,
        text: newMessage.text,
        timestamp: newMessage.timestamp.toISOString(),
        isRead: newMessage.isRead,
        referenceContext: referenceContext || undefined,
      },
    });
  } catch (err: any) {
    logger.error(err, 'Error sending chat message');
    return NextResponse.json({ error: err.message || 'Error sending chat message' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { collegeId, facultyId } = body;

    if (!collegeId || !facultyId) {
      return NextResponse.json({ error: 'Missing collegeId or facultyId' }, { status: 400 });
    }

    await prisma.facultyChatMessage.updateMany({
      where: {
        collegeId,
        facultyId,
        sender: 'faculty',
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Messages marked as read' });
  } catch (err: any) {
    logger.error(err, 'Error updating read status');
    return NextResponse.json({ error: err.message || 'Error updating read status' }, { status: 500 });
  }
}
