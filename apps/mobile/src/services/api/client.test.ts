import { client } from '@/services/api/client';

let mockRequestInterceptor: Function;
let mockResponseErrorInterceptor: Function;

jest.mock('axios', () => {
  const post = jest.fn();
  const main = jest.fn();

  return {
    __esModule: true,
    create: jest.fn(() =>
      Object.assign(main, {
        get: jest.fn(),
        post,
        interceptors: {
          request: {
            use: jest.fn((fn: Function) => {
              mockRequestInterceptor = fn;
              return 0;
            }),
          },
          response: {
            use: jest.fn((_: Function, err: Function) => {
              mockResponseErrorInterceptor = err;
              return 0;
            }),
          },
        },
      }),
    ),
    default: {
      create: jest.fn(() =>
        Object.assign(main, {
          get: jest.fn(),
          post,
          interceptors: {
            request: {
              use: jest.fn((fn: Function) => {
                mockRequestInterceptor = fn;
                return 0;
              }),
            },
            response: {
              use: jest.fn((_: Function, err: Function) => {
                mockResponseErrorInterceptor = err;
                return 0;
              }),
            },
          },
        }),
      ),
    },
  };
});

const mockGetState = jest.fn();
const mockClearSession = jest.fn().mockResolvedValue(undefined);
const mockSetSession = jest.fn().mockResolvedValue(undefined);

jest.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: () => mockGetState(),
  },
}));

const mockStorageClear = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/storage/secure-store', () => ({
  sessionStorage: {
    clear: () => mockStorageClear(),
    saveSession: jest.fn(),
    saveTokens: jest.fn(),
    getTokens: jest.fn(),
    getSession: jest.fn(),
  },
}));

jest.mock('@/config/env', () => ({
  env: { apiUrl: 'http://test-api/api' },
}));

function defaultState() {
  return {
    accessToken: null,
    refreshToken: null,
    actorType: 'student',
    student: null,
    adminProfile: null,
    clearSession: mockClearSession,
    setSession: mockSetSession,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetState.mockReturnValue(defaultState());
});

describe('api client', () => {
  describe('request interceptor', () => {
    it('adds Authorization header when accessToken exists', () => {
      const state = defaultState();
      (state as any).accessToken = 'test-access-token';
      mockGetState.mockReturnValue(state);

      const config = { headers: { set: jest.fn() } };
      const result = mockRequestInterceptor(config);

      expect(config.headers.set).toHaveBeenCalledWith(
        'Authorization',
        'Bearer test-access-token',
      );
      expect(result).toBe(config);
    });

    it('skips Authorization header when no accessToken', () => {
      mockGetState.mockReturnValue(defaultState());

      const config = { headers: { set: jest.fn() } };
      mockRequestInterceptor(config);

      expect(config.headers.set).not.toHaveBeenCalled();
    });
  });

  describe('response interceptor', () => {
    it('rejects non-401 errors without clearing session', async () => {
      const error = {
        response: { status: 500 },
        config: { headers: { set: jest.fn() } },
      };

      await expect(mockResponseErrorInterceptor!(error)).rejects.toBe(error);
      expect(mockClearSession).not.toHaveBeenCalled();
      expect(mockStorageClear).not.toHaveBeenCalled();
    });

    it('rejects 401 with _retry flag', async () => {
      const error = {
        response: { status: 401 },
        config: { headers: { set: jest.fn() }, _retry: true },
      };

      await expect(mockResponseErrorInterceptor!(error)).rejects.toBe(error);
    });

    it('clears session and rejects when 401 with no refreshToken', async () => {
      const state = defaultState();
      state.accessToken = null;
      state.refreshToken = null;
      mockGetState.mockReturnValue(state);

      const error = {
        response: { status: 401 },
        config: { headers: { set: jest.fn() } },
      };

      await expect(mockResponseErrorInterceptor!(error)).rejects.toBe(error);
      expect(mockClearSession).toHaveBeenCalled();
    });

    it('attempts refresh and retries original request on successful refresh', async () => {
      const state = defaultState();
      (state as any).accessToken = 'old-at';
      (state as any).refreshToken = 'old-rt';
      mockGetState.mockReturnValue(state);

      const mockPost = client.post as jest.Mock;
      const mockAxiosFn = client as unknown as jest.Mock;

      mockPost.mockResolvedValue({
        data: {
          data: {
            accessToken: 'new-at',
            refreshToken: 'new-rt',
          },
        },
      });

      mockAxiosFn.mockResolvedValue({ data: 'retry-success' });

      const configHeaders = { set: jest.fn() };
      const error = {
        response: { status: 401 },
        config: { headers: configHeaders },
      };

      await mockResponseErrorInterceptor!(error);

      expect(mockPost).toHaveBeenCalledWith('/student/auth/refresh', {
        refreshToken: 'old-rt',
      });
      expect(mockSetSession).toHaveBeenCalledWith({
        actorType: 'student',
        accessToken: 'new-at',
        refreshToken: 'new-rt',
        student: null,
      });
      expect(configHeaders.set).toHaveBeenCalledWith(
        'Authorization',
        'Bearer new-at',
      );
      expect(mockAxiosFn).toHaveBeenCalled();
    });

    it('uses admin refresh path for admin sessions', async () => {
      const state = defaultState();
      (state as any).accessToken = 'old-at';
      (state as any).refreshToken = 'old-rt';
      (state as any).actorType = 'admin';
      (state as any).adminProfile = {
        user: { id: 'u1', email: 'admin@example.com', effectivePermissions: [] },
        permissions: [],
        canAccessAdmin: true,
      };
      mockGetState.mockReturnValue(state);

      const mockPost = client.post as jest.Mock;
      const mockAxiosFn = client as unknown as jest.Mock;

      mockPost.mockResolvedValue({
        data: {
          data: {
            accessToken: 'new-at',
            refreshToken: 'new-rt',
            user: { id: 'u1', email: 'admin@example.com', effectivePermissions: [] },
            permissions: [],
            canAccessAdmin: true,
          },
        },
      });

      mockAxiosFn.mockResolvedValue({ data: 'retry-success' });

      const error = {
        response: { status: 401 },
        config: { headers: { set: jest.fn() } },
      };

      await mockResponseErrorInterceptor!(error);

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-rt',
      });
      expect(mockSetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          actorType: 'admin',
          accessToken: 'new-at',
          refreshToken: 'new-rt',
        }),
      );
    });

    it('clears session when refresh fails', async () => {
      const state = defaultState();
      (state as any).accessToken = 'old-at';
      (state as any).refreshToken = 'old-rt';
      mockGetState.mockReturnValue(state);

      (client.post as jest.Mock).mockRejectedValue(new Error('refresh failed'));

      const error = {
        response: { status: 401 },
        config: { headers: { set: jest.fn() } },
      };

      await expect(mockResponseErrorInterceptor!(error)).rejects.toBeDefined();
      expect(mockStorageClear).toHaveBeenCalled();
      expect(mockClearSession).toHaveBeenCalled();
    });

    it('shares a single refresh promise for concurrent 401s', async () => {
      const state = defaultState();
      (state as any).accessToken = 'old-at';
      (state as any).refreshToken = 'old-rt';
      mockGetState.mockReturnValue(state);

      let resolvePost!: (value: unknown) => void;
      (client.post as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePost = resolve;
          }),
      );

      (client as unknown as jest.Mock).mockResolvedValue({
        data: 'retry-success',
      });

      const error1 = {
        response: { status: 401 },
        config: { headers: { set: jest.fn() } },
      };
      const error2 = {
        response: { status: 401 },
        config: { headers: { set: jest.fn() } },
      };

      const p1 = mockResponseErrorInterceptor!(error1);
      const p2 = mockResponseErrorInterceptor!(error2);

      resolvePost!({
        data: {
          data: {
            accessToken: 'new-at',
            refreshToken: 'new-rt',
          },
        },
      });

      await Promise.all([p1, p2]);

      expect(client.post).toHaveBeenCalledTimes(1);
    });
  });
});
