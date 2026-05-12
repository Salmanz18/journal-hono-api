import type { MiddlewareHandler } from 'hono';

import { HEADERS } from '@config/constants';
import { UnauthorizedError } from '@lib/errors';
import { verifyToken } from '@lib/jwt';

import type { AppContext } from '@/types/context';

export const requireAuth = (): MiddlewareHandler<AppContext> => {
  return async (c, next) => {
    const header = c.req.header(HEADERS.AUTHORIZATION);
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed authorization header');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedError('Empty bearer token');
    }

    try {
      const payload = await verifyToken(token);
      c.set('user', payload);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }

    await next();
  };
};
