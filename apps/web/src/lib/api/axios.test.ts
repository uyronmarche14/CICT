import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@/lib/navigation', () => ({
  registerNavigate: vi.fn(),
  unregisterNavigate: vi.fn(),
  safePush: vi.fn(),
}));

import { safePush } from '@/lib/navigation';
import api from './axios';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:4000/api';

const mockedSafePush = vi.mocked(safePush);

describe('axios instance config', () => {
  it('sets withCredentials to true', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('sets xsrfCookieName to csrf_token', () => {
    expect(api.defaults.xsrfCookieName).toBe('csrf_token');
  });

  it('sets xsrfHeaderName to X-CSRF-Token', () => {
    expect(api.defaults.xsrfHeaderName).toBe('X-CSRF-Token');
  });
});

describe('response interceptor (admin redirect)', () => {
  const originalLocation = { ...window.location };

  function setPathname(pathname: string) {
    delete (window as Record<string, unknown>).location;
    window.location = { ...originalLocation, pathname } as Location;
  }

  function restoreLocation() {
    delete (window as Record<string, unknown>).location;
    window.location = originalLocation;
  }

  beforeEach(() => {
    server.resetHandlers();
    mockedSafePush.mockClear();
    restoreLocation();
  });

  async function triggerError(status: number, responseData?: { message?: string }) {
    server.use(
      http.get(`${API_URL}/test-endpoint`, () => {
        return HttpResponse.json(responseData ?? {}, { status });
      }),
      http.post(`${API_URL}/auth/refresh`, () => {
        return HttpResponse.json({}, { status: 401 });
      }),
    );

    try {
      await api.get('/test-endpoint');
    } catch {
      // expected
    }
  }

  it('redirects to /admin/login on 401 for admin pages', async () => {
    setPathname('/admin/dashboard');
    await triggerError(401);
    expect(mockedSafePush).toHaveBeenCalledWith('/admin/login');
  });

  it('does not redirect on 401 for non-admin pages', async () => {
    setPathname('/student/events');
    await triggerError(401);
    expect(mockedSafePush).not.toHaveBeenCalled();
  });

  it('does not redirect when already on /admin/login', async () => {
    setPathname('/admin/login');
    await triggerError(401);
    expect(mockedSafePush).not.toHaveBeenCalled();
  });

  it('redirects on 403 with "Your account has been deactivated" message', async () => {
    setPathname('/admin/dashboard');
    await triggerError(403, { message: 'Your account has been deactivated' });
    expect(mockedSafePush).toHaveBeenCalledWith('/admin/login');
  });

  it('redirects on 403 with "User no longer exists" message', async () => {
    setPathname('/admin/dashboard');
    await triggerError(403, { message: 'User no longer exists' });
    expect(mockedSafePush).toHaveBeenCalledWith('/admin/login');
  });

  it('redirects on 403 with "Your assigned role is no longer valid" message', async () => {
    setPathname('/admin/dashboard');
    await triggerError(403, { message: 'Your assigned role is no longer valid' });
    expect(mockedSafePush).toHaveBeenCalledWith('/admin/login');
  });

  it('does not redirect on 403 with unrelated message', async () => {
    setPathname('/admin/dashboard');
    await triggerError(403, { message: 'Forbidden access' });
    expect(mockedSafePush).not.toHaveBeenCalled();
  });

  it('refreshes with cookie-based /auth/refresh and retries the original request', async () => {
    setPathname('/admin/dashboard');
    let requestCount = 0;

    server.use(
      http.get(`${API_URL}/test-endpoint`, () => {
        requestCount += 1;
        if (requestCount === 1) {
          return HttpResponse.json({ message: 'expired' }, { status: 401 });
        }
        return HttpResponse.json({ success: true, data: { ok: true } });
      }),
      http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
        expect(await request.json()).toEqual({});
        return HttpResponse.json({ success: true });
      }),
    );

    const response = await api.get('/test-endpoint');

    expect(response.data).toEqual({ success: true, data: { ok: true } });
    expect(requestCount).toBe(2);
    expect(mockedSafePush).not.toHaveBeenCalled();
  });
});
