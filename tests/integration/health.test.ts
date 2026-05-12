import { describe, expect, it } from 'vitest';

import { createApp } from '@/app';

describe('GET /health', () => {
  it('returns 200 with success envelope', async () => {
    const app = createApp();
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
  });

  it('returns 404 envelope for unknown routes', async () => {
    const app = createApp();
    const res = await app.request('/this-route-does-not-exist');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
