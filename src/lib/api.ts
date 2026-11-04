import {API_URL} from '../config/env';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAuthTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
}

export function clearAuthTokens() {
  accessToken = null;
  refreshToken = null;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export class ApiError extends Error {
  status: number;
  isAccessDenied: boolean;

  constructor(status: number, message: string, isAccessDenied = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isAccessDenied = isAccessDenied;
  }
}

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers,
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_URL}${path}`, init);

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? (data as {detail: unknown}).detail
        : null;
    let message = `Request failed (${res.status})`;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (first && typeof first === 'object' && 'msg' in first) {
        message = String((first as {msg: unknown}).msg);
      }
    } else if (typeof detail === 'string') {
      message = detail;
    }
    throw new ApiError(res.status, message, res.status === 403);
  }

  return data as T;
}
