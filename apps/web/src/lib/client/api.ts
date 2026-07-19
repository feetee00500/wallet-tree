const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
      throw new ApiError('Session expired', 401);
    }

    let body: { message?: string; code?: string; errors?: Record<string, string[]> } = {};
    try {
      body = await response.json();
    } catch {
      // ignore parse errors
    }

    throw new ApiError(body.message || 'An unexpected error occurred', response.status, body.code, body.errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string, signal?: AbortSignal) {
  return apiClient<T>(path, { method: 'GET', signal });
}

export function apiPost<T>(path: string, body?: unknown) {
  return apiClient<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export function apiPatch<T>(path: string, body?: unknown) {
  return apiClient<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
}

export function apiDelete<T>(path: string) {
  return apiClient<T>(path, { method: 'DELETE' });
}
