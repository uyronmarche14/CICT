import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react-native';

let mockLogin: jest.Mock;
jest.mock('@/services/api/auth', () => {
  mockLogin = jest.fn();
  return {
    authApi: { login: (...args: unknown[]) => mockLogin(...args) },
  };
});

let mockSetSession: jest.Mock;
jest.mock('@/store/auth-store', () => {
  mockSetSession = jest.fn().mockResolvedValue(undefined);
  return {
    useAuthStore: (selector?: (state: unknown) => unknown) => {
      const state = { setSession: mockSetSession };
      return selector ? selector(state) : state;
    },
  };
});

import { useLoginMutation } from '@/features/auth/useLoginMutation';

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

describe('useLoginMutation', () => {
  it('calls setSession with returned data on successful login', async () => {
    const response = {
      accessToken: 'at',
      refreshToken: 'rt',
      student: {
        _id: 's1',
        studentNumber: '001',
        firstName: 'A',
        lastName: 'B',
      },
    };
    mockLogin.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useLoginMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        identifier: 'student@example.com',
        password: 'pass',
      });
    });

    expect(mockLogin).toHaveBeenCalledWith('student@example.com', 'pass');
    expect(mockSetSession).toHaveBeenCalledWith(response);
  });

  it('sets error state on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLoginMutation(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          identifier: 'bad',
          password: 'wrong',
        });
      } catch {
        // expected
      }
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
  });
});
