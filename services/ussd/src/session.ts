import { Redis } from 'ioredis';
import type { UssdSession } from '@hederanet/types';

const SESSION_TTL = 300; // 5 minutes

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379');
  }
  return _redis;
}

export async function getSession(sessionId: string): Promise<UssdSession | null> {
  const raw = await getRedis().get(`ussd:${sessionId}`);
  if (!raw) return null;
  return JSON.parse(raw) as UssdSession;
}

export async function setSession(session: UssdSession): Promise<void> {
  await getRedis().setex(`ussd:${session.sessionId}`, SESSION_TTL, JSON.stringify(session));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await getRedis().del(`ussd:${sessionId}`);
}

export function createSession(sessionId: string, phoneNumber: string): UssdSession {
  return {
    sessionId,
    phoneNumber,
    accountId: null,
    menuState: 'MAIN',
    data: {},
    createdAt: Date.now(),
  };
}

export async function getOrCreateSession(sessionId: string, phoneNumber: string): Promise<UssdSession> {
  const existing = await getSession(sessionId);
  if (existing) return existing;
  const session = createSession(sessionId, phoneNumber);
  await setSession(session);
  return session;
}

// Rate limit: 10 USSD sessions per phone per hour
const RATE_LIMIT_KEY = (phone: string) => `ussd:rate:${phone}`;

export async function checkRateLimit(phoneNumber: string): Promise<boolean> {
  const redis = getRedis();
  const key = RATE_LIMIT_KEY(phoneNumber);
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, 3600);
  return current <= 10;
}
