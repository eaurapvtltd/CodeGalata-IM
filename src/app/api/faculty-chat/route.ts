// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collegeId = searchParams.get('collegeId');
  const facultyId = searchParams.get('facultyId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId parameter' }, { status: 400 });
  }

  try {
    if (facultyId) {
      // Get chat messages
      const list = await prisma.facultyChatMessage.findMany({
        where: { collegeId, facultyId },
        orderBy: { timestamp: 'asc' },
      });

      const formatted = list.map((msg) => ({
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

      // Automatically mark faculty messages as read when admin loads the chat
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

      return NextResponse.json({ success: true, data: formatted });
    }

    // Get list of faculty members
    const list = await prisma.facultyMember.findMany({
      where: { collegeId },
      orderBy: { name: 'asc' },
    });

    const enrichedList = await Promise.all(
      list.map(async (f) => {
        const unreadCount = await prisma.facultyChatMessage.count({
          where: {
            facultyId: f.id,
            isRead: false,
            sender: 'faculty',
          },
        });

        return {
          ...f,
          createdAt: f.createdAt.toISOString(),
          lastSeen: f.lastSeen?.toISOString() || null,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: enrichedList });
  } catch (err: any) {
    logger.error('Faculty chat API GET error', err);
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

    const newMessage = await prisma.facultyChatMessage.create({
      data: {
        collegeId,
        facultyId,
        sender,
        senderName: senderName || (sender === 'admin' ? 'Super Admin' : 'Faculty Member'),
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
    logger.error('Faculty chat API POST error', err);
    return NextResponse.json({ error: err.message || 'Error sending chat message' }, { status: 500 });
  }
}
