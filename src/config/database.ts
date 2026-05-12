import { env, isProduction } from './env';

export const databaseConfig = {
  url: env.DATABASE_URL,
  max: isProduction ? 20 : 10,
  idleTimeout: 30,
  connectTimeout: 10,
  ssl: isProduction ? ('require' as const) : false,
} as const;
