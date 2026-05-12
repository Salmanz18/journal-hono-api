import { serve } from '@hono/node-server';

import { env } from '@config/env';
import { closeDatabase } from '@db/index';
import { logger } from '@lib/logger';

import { app } from './app';

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  ({ port }) => {
    logger.info(`🚀 Server listening on http://localhost:${port}`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   Health check: http://localhost:${port}/health`);
  },
);

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  const forceTimer = setTimeout(() => {
    logger.error('Forcing shutdown after 10s timeout');
    process.exit(1);
  }, 10_000);
  forceTimer.unref();

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await closeDatabase();
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
