import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getEnv } from '@/lib/validation/env';
import { createSession } from '@/lib/auth/session';
import { corsResponse } from '@/lib/auth/cors';

export async function GET(request: NextRequest) {
  const env = getEnv();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code) {
    const frontendUrl = env.FRONTEND_URL;
    return NextResponse.redirect(`${frontendUrl}/auth/callback?error=access_denied`);
  }

  try {
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.LINE_LOGIN_CALLBACK_URL,
        client_id: env.LINE_LOGIN_CHANNEL_ID,
        client_secret: env.LINE_LOGIN_CHANNEL_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };
    const accessToken = tokenData.access_token;

    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LINE profile');
    }

    const profile = (await profileResponse.json()) as {
      userId: string;
      displayName?: string;
      pictureUrl?: string;
    };
    const lineUserId = profile.userId;
    const displayName = profile.displayName || 'LINE User';
    const pictureUrl = profile.pictureUrl;

    const { getUsersCollection } = await import('@/lib/db/models');
    const users = await getUsersCollection();

    const now = new Date();
    const existingUser = await users.findOne({ lineUserId });

    let userId: string;
    if (existingUser) {
      await users.updateOne(
        { lineUserId },
        {
          $set: {
            displayName,
            pictureUrl,
            lastActiveAt: now,
            updatedAt: now,
          },
        }
      );
      userId = existingUser._id!.toString();
    } else {
      const result = await users.insertOne({
        lineUserId,
        displayName,
        pictureUrl,
        preferredCurrency: 'THB',
        timezone: 'Asia/Bangkok',
        language: 'th',
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
      } as any);
      userId = result.insertedId.toString();
    }

    await createSession({
      userId,
      lineUserId,
      createdAt: Date.now(),
    });

    return NextResponse.redirect(env.FRONTEND_URL + '/auth/callback');
  } catch (err) {
    console.error('LINE Login error:', err);
    const frontendUrl = env.FRONTEND_URL;
    return NextResponse.redirect(`${frontendUrl}/auth/callback?error=login_failed`);
  }
}
