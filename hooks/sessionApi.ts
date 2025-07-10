import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/utils';
import { ExtendSessionPayload, ExtendSessionResponse, StartSessionPayload, StartSessionResponse, StopSessionPayload, StopSessionResponse } from '@/type';



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