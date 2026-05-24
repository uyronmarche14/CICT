import { describe, expect, it, beforeEach } from 'vitest';
import { loginUser, logoutUser } from './authAPI';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

describe('authAPI', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('loginUser() returns user data on success', async () => {
    const result = await loginUser({ email: 'admin@example.com', password: 'password123' });
    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe('admin@example.com');
  });

  it('loginUser() throws on invalid credentials', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return HttpResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      })
    );

    await expect(loginUser({ email: 'wrong@example.com', password: 'wrong' })).rejects.toThrow();
  });

  it('logoutUser() succeeds', async () => {
    const result = await logoutUser();
    expect(result).toBeDefined();
  });
});
