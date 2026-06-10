import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetEligibleEvents = jest.fn();
const mockRegister = jest.fn();
const mockCancelRegistration = jest.fn();

jest.mock('@/services/api/events', () => ({
  eventsApi: {
    getEligibleEvents: () => mockGetEligibleEvents(),
    register: (...args: unknown[]) => mockRegister(...args),
    cancelRegistration: (...args: unknown[]) => mockCancelRegistration(...args),
  },
}));

jest.mock('@/services/storage/cache', () => ({
  fetchWithCache: jest.fn((_key: string, fetcher: () => unknown) => fetcher()),
}));

import {
  useStudentEvents,
  useRegisterForEvent,
  useCancelEventRegistration,
} from '@/features/events/useStudentEvents';

const mockEvents = [
  {
    _id: 'e1',
    title: 'Tech Talk',
    excerpt: 'A talk about tech',
    startDate: '2026-01-15T10:00:00Z',
    endDate: '2026-01-15T12:00:00Z',
    location: 'Auditorium',
    status: 'published',
    bodyHtml: '<p>Content</p>',
    registration: null,
  },
  {
    _id: 'e2',
    title: 'Workshop',
    excerpt: 'Hands-on workshop',
    startDate: '2026-02-01T09:00:00Z',
    endDate: '2026-02-01T17:00:00Z',
    location: 'Lab 3',
    status: 'published',
    bodyHtml: '<p>Workshop content</p>',
    registration: null,
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const originalConsoleError = console.error;
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (first.includes('not wrapped in act')) return;
    originalConsoleError.call(console, ...args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useStudentEvents', () => {
  it('returns events data when query succeeds', async () => {
    mockGetEligibleEvents.mockResolvedValueOnce(mockEvents);

    const { result } = renderHook(() => useStudentEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvents);
  });

  it('returns loading state initially', () => {
    mockGetEligibleEvents.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useStudentEvents(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useRegisterForEvent', () => {
  it('calls eventsApi.register with the eventId', async () => {
    mockRegister.mockResolvedValueOnce({ _id: 'reg1', status: 'registered' });

    const { result } = renderHook(() => useRegisterForEvent('e1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockRegister).toHaveBeenCalledWith('e1');
  });
});

describe('useCancelEventRegistration', () => {
  it('calls eventsApi.cancelRegistration with the eventId', async () => {
    mockCancelRegistration.mockResolvedValueOnce({ _id: 'reg1', status: 'cancelled' });

    const { result } = renderHook(() => useCancelEventRegistration('e1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockCancelRegistration).toHaveBeenCalledWith('e1');
  });
});
