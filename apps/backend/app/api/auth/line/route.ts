import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/validation/env';

export async function GET() {
  const env = getEnv();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.LINE_LOGIN_CHANNEL_ID,
    redirect_uri: env.LINE_LOGIN_CALLBACK_URL,
    state: 'todo-generate-state',
    scope: 'profile openid email',
  });

  const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;

  return NextResponse.redirect(loginUrl);
}
