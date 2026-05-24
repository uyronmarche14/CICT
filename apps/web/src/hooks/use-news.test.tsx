import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNews } from './use-news';
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

describe('useNews', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('returns news data on success', async () => {
    const { result } = renderHook(() => useNews(1, 10), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.news).toHaveLength(1);
    expect(result.current.data?.pagination.total).toBe(1);
  });

  it('accepts search and filter options', async () => {
    const { result } = renderHook(
      () => useNews(1, 10, 'published', { search: 'test' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.news[0].title).toBe('Test News');
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useNews(1, 10), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('handles API errors', async () => {
    server.use(
      http.get(`${API_URL}/news`, () => {
        return HttpResponse.json({ success: false, message: 'Server error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useNews(1, 10), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('maintains query key stability with same params', () => {
    const { result, rerender } = renderHook(
      ({ page }) => useNews(page, 10),
      { wrapper: createWrapper(), initialProps: { page: 1 } }
    );

    const key1 = result.current.queryKey;
    rerender({ page: 1 });
    const key2 = result.current.queryKey;

    expect(key1).toEqual(key2);
  });
});
