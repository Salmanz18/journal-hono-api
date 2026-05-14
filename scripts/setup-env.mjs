import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');
const envExamplePath = resolve(rootDir, '.env.example');
const envPath = resolve(rootDir, '.env');

if (existsSync(envPath)) {
  console.log('.env already exists. Leaving it unchanged.');
  process.exit(0);
}

const envExample = readFileSync(envExamplePath, 'utf8');
const jwtSecret = randomBytes(48).toString('base64url');

const envFile = envExample.replace(
  /^JWT_SECRET=.*$/m,
  `JWT_SECRET=${jwtSecret}`,
);

writeFileSync(envPath, envFile);

console.log('Created .env from .env.example with a generated JWT_SECRET.');
