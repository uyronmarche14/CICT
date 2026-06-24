import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import { useStudentRegistrations } from '@/features/registrations/useStudentRegistrations'

let mockGetRegistrations: jest.Mock
jest.mock('@/services/api/student', () => {
  mockGetRegistrations = jest.fn()
  return {
    studentApi: { getRegistrations: (...args: unknown[]) => mockGetRegistrations(...args) },
  }
})

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const originalConsoleError = console.error
beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const first = typeof args[0] === 'string' ? args[0] : ''
    if (first.includes('not wrapped in act')) return
    originalConsoleError.call(console, ...args)
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

const mockRegistrations = [
  {
    _id: 'r1',
    eventId: {
      _id: 'e1',
      title: 'Tech Conference',
      startDate: '2026-07-15T09:00:00Z',
      endDate: '2026-07-15T17:00:00Z',
      location: 'Auditorium A',
      status: 'published',
    },
    status: 'registered' as const,
    registeredAt: '2026-06-01T10:00:00Z',
    source: 'self' as const,
    studentId: 's1',
  },
  {
    _id: 'r2',
    eventId: {
      _id: 'e2',
      title: 'Workshop Day',
      startDate: '2026-06-20T08:00:00Z',
      endDate: '2026-06-20T12:00:00Z',
      location: 'Lab 3',
      status: 'published',
    },
    status: 'checked_in' as const,
    registeredAt: '2026-05-20T10:00:00Z',
    source: 'self' as const,
    studentId: 's1',
  },
  {
    _id: 'r3',
    eventId: {
      _id: 'e3',
      title: 'Old Seminar',
      startDate: '2026-01-10T09:00:00Z',
      endDate: '2026-01-10T12:00:00Z',
      location: 'Hall B',
      status: 'published',
    },
    status: 'cancelled' as const,
    registeredAt: '2026-01-01T10:00:00Z',
    cancelledAt: '2026-01-05T10:00:00Z',
    source: 'self' as const,
    studentId: 's1',
  },
]

describe('useStudentRegistrations', () => {
  it('returns registrations on successful fetch', async () => {
    mockGetRegistrations.mockResolvedValueOnce(mockRegistrations)

    const { result } = renderHook(() => useStudentRegistrations(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockRegistrations)
  })

  it('sets error state on failed fetch', async () => {
    mockGetRegistrations.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useStudentRegistrations(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })
})
