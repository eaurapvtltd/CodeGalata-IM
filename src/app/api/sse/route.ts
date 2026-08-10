import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send connection acknowledgement
      controller.enqueue(encoder.encode('data: {"status": "connected", "message": "SSE connection active"}\n\n'));

      // Periodically send ping to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: {"ping": "${new Date().toISOString()}"}\n\n`));
        } catch (err) {
          clearInterval(interval);
        }
      }, 15000);

      // Clean up connection
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none',
    },
  });
}
