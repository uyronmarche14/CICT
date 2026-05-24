import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetAnnouncements } from './get-announcements.hook';
import { type ReactNode } from 'react';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useGetAnnouncements', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('returns announcements list on success', async () => {
    const { result } = renderHook(
      () => useGetAnnouncements(1, 10),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 10000 });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.success).toBe(true);
  });

  it('fetches from public endpoint when publicOnly is true', async () => {
    const { result } = renderHook(
      () => useGetAnnouncements(1, 10, undefined, undefined, true),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 10000 });

    expect(result.current.data?.data).toHaveLength(1);
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(
      () => useGetAnnouncements(1, 10),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('handles API errors', async () => {
    server.use(
      http.get(`${API_URL}/announcements`, () => {
        return HttpResponse.json({ success: false, message: 'Server error' }, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useGetAnnouncements(1, 10),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 10000 });
  });
});
