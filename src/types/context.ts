import type { PinoLogger } from 'hono-pino';

import type { TokenPayload } from '@lib/jwt';

export interface AppVariables {
  requestId: string;
  logger: PinoLogger;
  user?: TokenPayload;
}

export interface AppContext {
  Variables: AppVariables;
}
