export interface ResponseMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  requestId?: string;
  [key: string]: unknown;
}

export interface ResponseError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ResponseError | null;
  meta: ResponseMeta;
}

export function successResponse<T>(data: T, meta: ResponseMeta = {}): ApiResponse<T> {
  return { success: true, data, error: null, meta };
}

export function errorResponse(error: ResponseError, meta: ResponseMeta = {}): ApiResponse<null> {
  return { success: false, data: null, error, meta };
}
