import { sign, verify } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { env } from '@config/env';

export interface TokenPayload extends JWTPayload {
  sub: string;
  email?: string;
  role?: string;
}

function parseExpiresIn(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) {
      throw new Error(`Invalid JWT_EXPIRES_IN: ${value}`);
    }
    return Math.floor(Date.now() / 1000) + asNumber;
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const seconds = unit ? (multipliers[unit] ?? 1) : 1;
  return Math.floor(Date.now() / 1000) + amount * seconds;
}

const JWT_ALG = 'HS256' as const;

export async function signToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    { ...payload, iat: now, exp: parseExpiresIn(env.JWT_EXPIRES_IN) },
    env.JWT_SECRET,
    JWT_ALG,
  );
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  return (await verify(token, env.JWT_SECRET, JWT_ALG)) as TokenPayload;
}
