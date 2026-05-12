import { z } from 'zod';

export const uuidSchema = z.string().uuid('Must be a valid UUID');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const idParamSchema = z.object({ id: uuidSchema });
