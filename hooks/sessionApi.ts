import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';

// --- Types matching backend contract ---
export interface StartSessionPayload {
  userId: string;
}
export interface StartSessionResponse {
  message: string;
  sessionId: string;
  userId: string;
  api_base_url: string;
  gui_url: string;
  direct_https_url: string;
  containerId: string;
  containerName: string;
  containerIp: string;
  publishedPort: string;
  starting_time: string;
  expires_in: number;
  usage_notes: {
    recommended: string;
    direct: string;
  };
}

export interface StopSessionPayload {
  containerId: string;
}
export interface StopSessionResponse {
  message: string;
  containerId: string;
}

export interface ExtendSessionPayload {
  containerId: string;
  duration?: number;
}
export interface ExtendSessionResponse {
  message: string;
  containerId: string;
  expires_at: string;
}

// --- React Query hooks ---
export function useStartSession(token?: string) {
  return useMutation<StartSessionResponse, Error, StartSessionPayload>({
    mutationFn: (payload) =>
      apiFetch('/api/browser/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token),
  });
}

export function useStopSession(token?: string) {
  return useMutation<StopSessionResponse, Error, StopSessionPayload>({
    mutationFn: (payload) =>
      apiFetch('/api/browser/stop', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token),
  });
}

export function useExtendSession(token?: string) {
  return useMutation<ExtendSessionResponse, Error, ExtendSessionPayload>({
    mutationFn: (payload) =>
      apiFetch('/api/browser/extend', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token),
  });
} 