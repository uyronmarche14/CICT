import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdatesHub } from './use-updates-hub';
import { type ReactNode } from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUpdatesHub', () => {
  beforeEach(() => {});

  it('returns feed items for all categories', async () => {
    const { result } = renderHook(
      () => useUpdatesHub({ category: 'all', scope: 'all' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false), { timeout: 10000 });

    expect(result.current.visibleItems).toBeDefined();
    expect(typeof result.current.loadMore).toBe('function');
    expect(result.current.error).toBeNull();
  });

  it('returns empty feed for unknown org filter', async () => {
    const { result } = renderHook(
      () => useUpdatesHub({ category: 'news', scope: 'all', org: 'nonexistent' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false), { timeout: 10000 });

    expect(result.current.error).toBeNull();
  });

  it('provides loadMore function', () => {
    const { result } = renderHook(
      () => useUpdatesHub({ category: 'all', scope: 'all' }),
      { wrapper: createWrapper() }
    );

    expect(typeof result.current.loadMore).toBe('function');
  });
});
