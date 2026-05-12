import { afterAll, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT ?? '0';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/hono_journal_test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-with-at-least-32-characters-aaaaa';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'silent';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

beforeAll(async () => {
  // TODO: spin up test resources (e.g., reset DB) here.
});

afterAll(async () => {
  // TODO: tear down test resources here.
});
