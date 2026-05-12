import type { Context } from 'hono';

import type { AppContext } from '@/types/context';

type Handler = (c: Context<AppContext>) => Promise<Response> | Response;

export function asyncHandler(handler: Handler): Handler {
  return async (c) => {
    return handler(c);
  };
}
