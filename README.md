# Hono Journal API

A production-ready backend boilerplate built on [Hono](https://hono.dev), TypeScript, and
[Drizzle ORM](https://orm.drizzle.team). It ships with a clean, layered architecture
(routes → controllers → services → repositories), strict type-safety, structured logging,
JWT auth scaffolding, validation, and a fully-wired CI pipeline — but **no business logic**.
It is the starting point you copy into a new repo so the first feature is the only thing you
have to think about.

---

## Tech Stack

| Layer            | Library                                    | Version   |
| ---------------- | ------------------------------------------ | --------- |
| Runtime          | Node.js                                    | ≥ 20      |
| HTTP framework   | [Hono](https://hono.dev)                   | ^4.6      |
| Node adapter     | `@hono/node-server`                        | ^1.13     |
| Language         | TypeScript (strict)                        | ^5.7      |
| ORM              | [Drizzle ORM](https://orm.drizzle.team)    | ^0.38     |
| Postgres driver  | `postgres`                                 | ^3.4      |
| Validation       | [Zod](https://zod.dev)                     | ^3.24     |
| Validator bridge | `@hono/zod-validator`                      | ^0.4      |
| Auth             | `hono/jwt`                                 | bundled   |
| Logging          | [Pino](https://getpino.io) + `hono-pino`   | ^9 / ^0.7 |
| Testing          | [Vitest](https://vitest.dev)               | ^2.1      |
| Linting          | ESLint 9 (flat config) + typescript-eslint | ^9 / ^8   |
| Formatting       | Prettier                                   | ^3.4      |
| Package manager  | pnpm                                       | ≥ 10      |

---

## Prerequisites

- **Node.js** ≥ 20 (use `nvm`, `fnm`, or `volta`)
- **pnpm** ≥ 10 — install via `corepack enable && corepack prepare pnpm@10.33.4 --activate`
- **PostgreSQL** ≥ 14 running locally (or accessible via `DATABASE_URL`)

> The project is intentionally portable: swapping `@hono/node-server` for `bun`, `deno serve`,
> or a Cloudflare Workers entry point is a one-file change. See [Deployment Notes](#deployment-notes).

---

## Getting Started

```bash
# 1. Clone & install
git clone <your-repo-url>
cd hono-journal-api
pnpm install

# 2. Configure environment
pnpm setup:env
# Edit .env — at minimum set DATABASE_URL

# 3. Create the database
createdb hono_journal     # or use any existing Postgres instance

# 4. Generate & apply schema (once you add tables to src/db/schema)
pnpm db:generate
pnpm db:migrate

# 5. Run the dev server
pnpm dev
```

Visit [http://localhost:3000/health](http://localhost:3000/health) — you should see:

```json
{
  "success": true,
  "data": { "status": "ok", "env": "development", "uptime": 1.23, "timestamp": "..." },
  "error": null,
  "meta": {}
}
```

---

## Available Scripts

| Command              | What it does                                                             |
| -------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`           | Start the dev server with `tsx watch` (hot reload)                       |
| `pnpm build`         | Compile TypeScript → `dist/`                                             |
| `pnpm start`         | Run the compiled production server                                       |
| `pnpm lint`          | Run ESLint on the whole project                                          |
| `pnpm lint:fix`      | Run ESLint with `--fix`                                                  |
| `pnpm format`        | Format every file with Prettier                                          |
| `pnpm format:check`  | Verify formatting without writing (used in CI)                           |
| `pnpm typecheck`     | `tsc --noEmit` — strict type-check only                                  |
| `pnpm test`          | Run the Vitest suite                                                     |
| `pnpm test:coverage` | Run tests with v8 coverage                                               |
| `pnpm db:generate`   | Generate a new Drizzle migration from the current schema                 |
| `pnpm db:migrate`    | Apply pending migrations                                                 |
| `pnpm db:push`       | Push the schema directly to the DB (dev shortcut, skips migration files) |
| `pnpm db:studio`     | Open Drizzle Studio (web UI for your data)                               |

---

## Project Structure

```
hono-journal-api/
├── .github/
│   └── workflows/ci.yml          # Lint, typecheck, test, build on every PR
├── .vscode/                      # Editor settings + recommended extensions
├── drizzle/                      # Reserved for Drizzle-Kit output (history, snapshots)
├── src/
│   ├── config/                   # App-wide configuration loaded once at startup
│   │   ├── env.ts                #   Zod-validated environment loader (fail-fast)
│   │   ├── database.ts           #   Postgres pool tuning
│   │   └── constants.ts          #   HTTP status codes, API prefix, rate-limit defaults
│   ├── db/
│   │   ├── schema/index.ts       # Re-exports every module's Drizzle tables for drizzle-kit
│   │   ├── migrations/           # Generated SQL migrations (tracked in git)
│   │   ├── seeds/                # Optional seed scripts
│   │   └── index.ts              # Drizzle client + graceful `closeDatabase()`
│   ├── modules/                  # 👈 Feature modules go here — see "Module Pattern" below
│   ├── middleware/
│   │   ├── auth.middleware.ts        # JWT bearer-token guard
│   │   ├── error-handler.middleware.ts # Central error → JSON envelope
│   │   ├── rate-limit.middleware.ts  # In-memory token-bucket limiter
│   │   ├── request-id.middleware.ts  # Generates / propagates X-Request-Id
│   │   └── index.ts                  # Barrel export
│   ├── lib/                      # Reusable cross-cutting helpers
│   │   ├── logger.ts             #   Pino instance (pretty in dev, JSON in prod)
│   │   ├── jwt.ts                #   sign/verify thin wrapper over hono/jwt
│   │   └── errors.ts             #   AppError + typed subclasses (BadRequest, NotFound, …)
│   ├── utils/                    # Pure helper functions, no side effects
│   │   ├── response.ts           #   `{ success, data, error, meta }` envelope builders
│   │   ├── async-handler.ts      #   Optional wrapper for promise-returning handlers
│   │   └── validators.ts         #   Shared Zod schemas (UUID, pagination, …)
│   ├── types/                    # Ambient + shared types
│   │   ├── env.d.ts              #   Ambient `process.env` augmentation
│   │   ├── context.ts            #   Hono `Variables` / `AppContext` shape
│   │   └── index.ts
│   ├── routes/index.ts           # Top-level router — mounts every feature module
│   ├── app.ts                    # Builds the Hono app (middleware + routes) — no listen()
│   └── server.ts                 # Node entry point: listen + graceful shutdown
├── tests/
│   ├── integration/              # Hit the real `app.fetch` (or a test DB)
│   ├── unit/                     # Pure functions, services with mocked deps
│   └── setup.ts                  # Vitest globals + env defaults
├── scripts/                      # One-off / ops scripts (TS or shell)
├── .env.example                  # Documented template — never commit real .env
├── eslint.config.js              # Flat config (ESLint v9)
├── drizzle.config.ts             # drizzle-kit settings
├── tsconfig.json                 # Strict TS + path aliases
├── vitest.config.ts              # Vitest + matching aliases
└── package.json
```

---

## Architecture

This project uses a **layered (clean) architecture**. Each layer has a single responsibility,
depends only on layers below it, and is independently testable.

```
            ┌─────────────────────────────────────────────────────┐
HTTP in ───►│ Hono middleware (request-id, logger, CORS, rate-limit, auth)
            └────────────────────────────────┬────────────────────┘
                                             ▼
                                ┌────────────────────────┐
                                │ Route   (Hono router)  │  src/modules/<f>/<f>.routes.ts
                                │  - binds path + verb   │
                                │  - runs zod-validator  │
                                └───────────┬────────────┘
                                            ▼
                                ┌────────────────────────┐
                                │ Controller             │  <f>.controller.ts
                                │  - parses HTTP context │
                                │  - shapes the response │
                                └───────────┬────────────┘
                                            ▼
                                ┌────────────────────────┐
                                │ Service (use case)     │  <f>.service.ts
                                │  - business rules      │
                                │  - orchestrates repos  │
                                └───────────┬────────────┘
                                            ▼
                                ┌────────────────────────┐
                                │ Repository             │  <f>.repository.ts
                                │  - Drizzle queries     │
                                │  - returns domain rows │
                                └───────────┬────────────┘
                                            ▼
                                ┌────────────────────────┐
                                │ Database (Postgres)    │
                                └────────────────────────┘
```

### Layer responsibilities

| Layer          | Owns                                        | Must NOT do                             |
| -------------- | ------------------------------------------- | --------------------------------------- |
| **Middleware** | Cross-cutting (auth, logging, CORS, limits) | Business decisions                      |
| **Routes**     | HTTP method/path → controller; input shape  | Talk to DB or contain logic             |
| **Controller** | Read context, call service, build response  | Issue SQL, contain rules                |
| **Service**    | Business rules, transactions, orchestration | Touch `Context` or build HTTP responses |
| **Repository** | Pure Drizzle queries returning typed rows   | Throw HTTP errors, know about Hono      |
| **DB schema**  | Table definitions (Drizzle)                 | —                                       |

### Why this separation matters

- **Testability.** Services are plain functions of plain data — you can unit-test them
  with no HTTP, no DB, no Hono. Controllers are thin enough to cover end-to-end with
  integration tests against `app.fetch`.
- **Swappability.** Want to move from Postgres to SQLite? Replace the repository. Want
  to expose the same service over gRPC or a queue worker? Reuse the service — only the
  route/controller changes.
- **Predictability.** When you onboard someone, they always look in the same place: routes
  for the URL, services for the logic, repositories for the SQL.
- **No layer bypassing.** Routes never reach into the DB; controllers never hand-build SQL.
  The rule is enforced by review and (optionally) by an ESLint `import/no-restricted-paths`
  rule once your codebase grows.

---

## Module Pattern

A "feature" lives entirely inside one folder under `src/modules/<feature>/`. This is the
**only** place new domain code should land — `lib/`, `utils/`, `middleware/`, etc. are for
truly cross-cutting concerns.

```
src/modules/<feature>/
├── <feature>.routes.ts        # Hono router — wires URLs to controller methods
├── <feature>.controller.ts    # HTTP-layer: parses request, returns response envelope
├── <feature>.service.ts       # Business logic — pure, framework-agnostic
├── <feature>.repository.ts    # Drizzle queries — returns typed rows
├── <feature>.schema.ts        # Zod input schemas + Drizzle table definitions (or split into <feature>.model.ts)
├── <feature>.types.ts         # Domain types / DTOs not generated from Zod/Drizzle
└── <feature>.test.ts          # Vitest specs colocated with the code
```

### Adding a new module — step by step

1. **Create the folder** under `src/modules/` (e.g., `src/modules/journals/`).
2. **Define the schema.** In `journals.schema.ts`, export Drizzle tables AND Zod input
   schemas (`createJournalSchema`, `updateJournalSchema`, …).
3. **Re-export tables** from `src/db/schema/index.ts` so `drizzle-kit` picks them up:

   ```ts
   export * from '@modules/journals/journals.schema';
   ```

4. **Write the repository.** Pure Drizzle queries — no Hono, no Zod, no `throw new HTTPException`.
   Return domain rows or `null`/`undefined`.
5. **Write the service.** Compose repositories, enforce invariants, throw `AppError`
   subclasses (`NotFoundError`, `ConflictError`, …) when rules are violated.
6. **Write the controller.** Reads `c.req.valid('json')`, calls the service, returns
   `c.json(successResponse(result))`.
7. **Wire the router.** In `journals.routes.ts`:

   ```ts
   import { Hono } from 'hono';
   import { zValidator } from '@hono/zod-validator';
   import * as controller from './journals.controller';
   import { createJournalSchema } from './journals.schema';
   import type { AppContext } from '@types/context';

   export const journalsRoutes = new Hono<AppContext>()
     .get('/', controller.list)
     .post('/', zValidator('json', createJournalSchema), controller.create);
   ```

8. **Mount it** in `src/routes/index.ts`:

   ```ts
   import { journalsRoutes } from '@modules/journals/journals.routes';
   routes.route('/journals', journalsRoutes);
   ```

9. **Generate a migration** and apply it:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

10. **Test it.** Drop `journals.test.ts` next to the code — Vitest will pick it up.

---

## Conventions

### File naming

- **Files / folders:** `kebab-case` (`user-profile.service.ts`, `rate-limit.middleware.ts`)
- **Classes & types:** `PascalCase` (`AppError`, `TokenPayload`)
- **Functions & variables:** `camelCase` (`createUser`, `dbClient`)
- **Constants:** `SCREAMING_SNAKE_CASE` (`HTTP_STATUS`, `API_PREFIX`)
- **Module files:** suffix with their role (`.routes.ts`, `.service.ts`, …). One feature = one folder.

### Path aliases

Configured in [tsconfig.json](tsconfig.json) and mirrored in [vitest.config.ts](vitest.config.ts):

| Alias           | Resolves to        |
| --------------- | ------------------ |
| `@/*`           | `src/*`            |
| `@config/*`     | `src/config/*`     |
| `@modules/*`    | `src/modules/*`    |
| `@middleware/*` | `src/middleware/*` |
| `@lib/*`        | `src/lib/*`        |
| `@utils/*`      | `src/utils/*`      |
| `@db/*`         | `src/db/*`         |

> `src/types/*` is reached through `@/types/...` rather than a dedicated alias —
> TypeScript reserves the `@types/` prefix for DefinitelyTyped packages and refuses
> to honor a path mapping with that name.

### Import order (enforced by `eslint-plugin-simple-import-sort`)

ESLint will automatically sort imports into these groups:

1. Node built-ins (`node:crypto`)
2. External packages (`hono`, `zod`)
3. Path-aliased modules (`@config/*`, `@modules/*`, `@lib/*`, …)
4. Relative imports (`./foo`, `../bar`)
5. Type-only imports get the `import type { … }` form (auto-fix via `consistent-type-imports`).

Run `pnpm lint:fix` to sort everything.

### Error handling

- Throw — don't return — typed errors from `@lib/errors`:
  `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`,
  `ConflictError`, `ValidationError`, `RateLimitError`.
- All `AppError`s carry a `statusCode`, a stable `code` (e.g. `"NOT_FOUND"`), an
  optional `details` payload, and `isOperational: true`.
- The error middleware ([src/middleware/error-handler.middleware.ts](src/middleware/error-handler.middleware.ts))
  converts any thrown error into the standard envelope. `ZodError` is auto-translated to
  a `422 VALIDATION_ERROR`. Unknown errors become a redacted `500` in production.
- **Never** catch an error just to re-throw a new one without context. **Never** swallow
  errors silently.

### Response format

Every endpoint — success or failure — returns the same envelope:

```ts
interface ApiResponse<T> {
  success: boolean; // true | false
  data: T | null; // present on success
  error: {
    // present on failure
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta: {
    // pagination, request-id, etc.
    requestId?: string;
    page?: number;
    perPage?: number;
    total?: number;
    [key: string]: unknown;
  };
}
```

Build it with the helpers in [src/utils/response.ts](src/utils/response.ts):

```ts
return c.json(successResponse(user, { requestId: c.get('requestId') }));
```

---

## Environment Variables

All env vars are validated at startup by [src/config/env.ts](src/config/env.ts). If any
required var is missing or malformed, the process exits with a printed list of errors —
no silent half-broken boots.

| Variable         | Required | Description                                         | Example                                               |
| ---------------- | :------: | --------------------------------------------------- | ----------------------------------------------------- |
| `NODE_ENV`       |          | `development` \| `test` \| `production`             | `development`                                         |
| `PORT`           |          | HTTP port (default `3000`)                          | `3000`                                                |
| `DATABASE_URL`   |    ✅    | Postgres connection string                          | `postgres://postgres:postgres@localhost:5432/journal` |
| `JWT_SECRET`     |    ✅    | Signing key — **≥ 32 chars**, never commit          | `replace-me-with-a-strong-random-secret`              |
| `JWT_EXPIRES_IN` |          | Token lifetime — `Ns`, `Nm`, `Nh`, `Nd`, or seconds | `7d`                                                  |
| `LOG_LEVEL`      |          | `fatal\|error\|warn\|info\|debug\|trace`            | `debug`                                               |
| `CORS_ORIGIN`    |          | Allowed origin(s), comma-separated, or `*`          | `http://localhost:5173,https://app.example.com`       |

---

## Database

The Postgres client and Drizzle instance live in [src/db/index.ts](src/db/index.ts). Import
`db` anywhere you need to run a query.

### Workflow

```bash
# 1. Edit your tables (typically inside src/modules/<feature>/<feature>.schema.ts)
# 2. Make sure they're re-exported from src/db/schema/index.ts
# 3. Generate a migration file
pnpm db:generate

# 4. Apply pending migrations
pnpm db:migrate

# Or, during early prototyping, push directly without writing a migration file:
pnpm db:push
```

### Seed data

Put scripts in [src/db/seeds/](src/db/seeds). A typical pattern:

```ts
// src/db/seeds/dev.ts
import { db } from '@db/index';
// import { users } from '@modules/users/users.schema';

async function seed() {
  // await db.insert(users).values([...]);
}

seed().then(() => process.exit(0));
```

Run via `pnpm tsx src/db/seeds/dev.ts`.

### Drizzle Studio

```bash
pnpm db:studio
```

A local web UI for browsing and editing rows. Handy for verifying migrations.

---

## Testing

Tests are run with **Vitest** in Node environment. The setup file
[tests/setup.ts](tests/setup.ts) installs safe defaults for env vars so tests never
accidentally hit production resources.

### Where things go

| Kind            | Location                                                   | Example                                      |
| --------------- | ---------------------------------------------------------- | -------------------------------------------- |
| **Unit**        | `src/modules/<feature>/<feature>.test.ts` OR `tests/unit/` | Service logic, pure helpers                  |
| **Integration** | `tests/integration/`                                       | Boot `app`, send `Request`s, assert envelope |

### Unit test sketch

```ts
import { describe, expect, it, vi } from 'vitest';
import { JournalService } from '@modules/journals/journals.service';

describe('JournalService.create', () => {
  it('rejects empty titles', async () => {
    const repo = { insert: vi.fn() } as never;
    const service = new JournalService(repo);
    await expect(service.create({ title: '' })).rejects.toThrowError(/title/i);
  });
});
```

### Integration test sketch

```ts
import { describe, expect, it } from 'vitest';
import { app } from '@/app';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
  });
});
```

Run:

```bash
pnpm test                # watch mode
pnpm test --run          # CI-style single run
pnpm test:coverage       # with v8 coverage
```

---

## Code Quality

| Tool       | Command                    | What it checks                                                          |
| ---------- | -------------------------- | ----------------------------------------------------------------------- |
| Prettier   | `pnpm format`              | Formatting — single quotes, semis, trailing commas, 100-col width       |
| ESLint 9   | `pnpm lint`                | `typescript-eslint` strict + stylistic, import sort, unused imports     |
| TypeScript | `pnpm typecheck`           | Strict mode + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| GitHub CI  | `.github/workflows/ci.yml` | `format:check` → `lint` → `typecheck` → `test` → `build`                |

---

## Deployment Notes

The runtime layer is intentionally thin. Only [src/server.ts](src/server.ts) imports
`@hono/node-server`; the rest of the code talks to Hono's standards-based `Request` /
`Response`. To port:

- **Bun** — replace `src/server.ts` with `Bun.serve({ fetch: app.fetch, port })`. Remove
  `@hono/node-server` from dependencies. The `postgres` driver works in Bun unchanged.
- **Deno** — `Deno.serve({ port }, app.fetch)`. Switch to a Deno-compatible Postgres driver
  (e.g., `deno-postgres`) or run via `npm:` specifiers.
- **Cloudflare Workers** — export `{ fetch: app.fetch }` from a new `worker.ts`. Replace
  the Postgres driver with [Neon serverless](https://neon.tech/docs/serverless/serverless-driver)
  or [Hyperdrive](https://developers.cloudflare.com/hyperdrive/). The in-memory rate limiter
  in [src/middleware/rate-limit.middleware.ts](src/middleware/rate-limit.middleware.ts) must
  be swapped for KV / Durable Objects.

Other things to verify before production:

- **Secrets** — never bake `JWT_SECRET` into an image; mount via the platform's secret store.
- **Pool size** — `databaseConfig.max` in [src/config/database.ts](src/config/database.ts)
  is conservative; tune per instance.
- **Logging** — Pino emits JSON in production (`pino-pretty` is dev-only). Pipe stdout to
  your log aggregator (Datadog, Loki, etc.).

---

## License

MIT — see [LICENSE](LICENSE) (add one when you fork this).
