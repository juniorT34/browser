import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = 'https://albizblog.online';
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  // Ensure headers is always a plain object
  let extraHeaders: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        extraHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        extraHeaders[key] = value;
      });
    } else {
      extraHeaders = options.headers as Record<string, string>;
    }
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errorMsg = `API error: ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
