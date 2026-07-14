import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.text();

  try {
    const payload = JSON.parse(body);
    const events = payload.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message?.type === 'text') {
        const text = event.message.text.trim();
        const replyToken = event.replyToken;
        const userId = event.source?.userId;

        if (!userId) continue;

        console.log(`LINE message from ${userId}: ${text}`);
      }
    }

    return NextResponse.json({});
  } catch {
    return NextResponse.json({});
  }
}
