import type { Context, ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

import { HTTP_STATUS } from '@config/constants';
import { isProduction } from '@config/env';
import { AppError } from '@lib/errors';
import { errorResponse } from '@utils/response';

import type { AppContext } from '@/types/context';

function buildMeta(c: Context<AppContext>) {
  return { requestId: c.get('requestId') };
}

export const errorHandler: ErrorHandler<AppContext> = (err, c) => {
  const logger = c.get('logger') ?? console;

  if (err instanceof AppError) {
    logger.warn?.({ err, code: err.code }, err.message);
    return c.json(
      errorResponse(
        {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
        buildMeta(c),
      ),
      err.statusCode as never,
    );
  }

  if (err instanceof ZodError) {
    logger.warn?.({ issues: err.issues }, 'Validation error');
    return c.json(
      errorResponse(
        {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: err.flatten(),
        },
        buildMeta(c),
      ),
      HTTP_STATUS.UNPROCESSABLE_ENTITY as never,
    );
  }

  if (err instanceof HTTPException) {
    return c.json(
      errorResponse({ code: 'HTTP_EXCEPTION', message: err.message || 'HTTP error' }, buildMeta(c)),
      err.status,
    );
  }

  logger.error?.({ err }, 'Unhandled error');
  return c.json(
    errorResponse(
      {
        code: 'INTERNAL_ERROR',
        message: isProduction ? 'Internal server error' : (err as Error).message,
      },
      buildMeta(c),
    ),
    HTTP_STATUS.INTERNAL_SERVER_ERROR as never,
  );
};

export const notFoundHandler: NotFoundHandler<AppContext> = (c) => {
  return c.json(
    errorResponse(
      { code: 'NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} not found` },
      buildMeta(c),
    ),
    HTTP_STATUS.NOT_FOUND as never,
  );
};
