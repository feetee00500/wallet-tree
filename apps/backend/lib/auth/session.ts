import { cookies } from 'next/headers';
import { getEnv } from '../validation/env';

const SESSION_COOKIE_NAME = 'wallet-tree-session';

export interface SessionData {
  userId: string;
  lineUserId: string;
  createdAt: number;
}

export async function createSession(data: SessionData): Promise<void> {
  const env = getEnv();
  const cookieStore = await cookies();

  const sessionValue = Buffer.from(JSON.stringify(data)).toString('base64');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires,
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie) return null;

    const data = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    ) as SessionData;

    return data;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
}
