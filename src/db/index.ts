import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { databaseConfig } from '@config/database';

import * as schema from './schema';

const client = postgres(databaseConfig.url, {
  max: databaseConfig.max,
  idle_timeout: databaseConfig.idleTimeout,
  connect_timeout: databaseConfig.connectTimeout,
  ssl: databaseConfig.ssl,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;

export async function closeDatabase(): Promise<void> {
  await client.end({ timeout: 5 });
}
