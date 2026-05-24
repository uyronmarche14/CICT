import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNewsById } from './use-news-by-id';
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

describe('useNewsById', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('returns news detail on success', async () => {
    const { result } = renderHook(() => useNewsById('news-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?._id).toBe('news-1');
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useNewsById('news-1'), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('handles API errors', async () => {
    server.use(
      http.get(`${API_URL}/news/:id`, () => {
        return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useNewsById('nonexistent'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
