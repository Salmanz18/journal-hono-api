import { randomUUID } from 'node:crypto';

import type { MiddlewareHandler } from 'hono';

import { HEADERS } from '@config/constants';

import type { AppContext } from '@/types/context';

export const requestId = (): MiddlewareHandler<AppContext> => {
  return async (c, next) => {
    const incoming = c.req.header(HEADERS.REQUEST_ID);
    const id = incoming ?? randomUUID();
    c.set('requestId', id);
    c.header(HEADERS.REQUEST_ID, id);
    await next();
  };
};
