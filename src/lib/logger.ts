import pino from 'pino';

import { env, isDevelopment } from '@config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname,env',
      },
    },
  }),
});

export type Logger = typeof logger;
