import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { pinoLogger } from 'hono-pino';

import { API_PREFIX } from '@config/constants';
import { env } from '@config/env';
import { logger } from '@lib/logger';
import { errorHandler, notFoundHandler, rateLimit, requestId } from '@middleware/index';
import { successResponse } from '@utils/response';

import { routes } from '@/routes';
import type { AppContext } from '@/types/context';

export function createApp() {
  const app = new Hono<AppContext>();

  app.use('*', requestId());
  app.use(
    '*',
    pinoLogger({
      pino: logger,
      http: {
        referRequestIdKey: 'requestId',
      },
    }),
  );
  app.use(
    '*',
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      exposeHeaders: ['X-Request-Id'],
      credentials: true,
      maxAge: 86400,
    }),
  );
  app.use('*', secureHeaders());
  app.use(`${API_PREFIX}/*`, rateLimit());

  app.get('/health', (c) =>
    c.json(
      successResponse({
        status: 'ok',
        env: env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    ),
  );

  app.route(API_PREFIX, routes);

  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}

export const app = createApp();
export type App = ReturnType<typeof createApp>;
