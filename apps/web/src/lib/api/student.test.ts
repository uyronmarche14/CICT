import { describe, expect, it, beforeEach, vi } from 'vitest';
import { studentAuthAPI } from './student';

describe('studentAuthAPI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('login() returns auth profile with tokens', async () => {
    const result = await studentAuthAPI.login('2020-00001', 'password123');
    expect(result.accessToken).toBe('test-access-token');
    expect(result.refreshToken).toBe('test-refresh-token');
    expect(result.student.studentNumber).toBe('2020-00001');
  });

  it('me() returns student profile when authenticated', async () => {
    localStorage.setItem('student_access_token', 'test-access-token');
    const result = await studentAuthAPI.me();
    expect(result.studentNumber).toBe('2020-00001');
    expect(result.firstName).toBe('Test');
  });

  it('logout() calls backend and resolves', async () => {
    localStorage.setItem('student_access_token', 'test-access-token');
    localStorage.setItem('student_refresh_token', 'test-refresh-token');

    await expect(studentAuthAPI.logout()).resolves.not.toThrow();
  });
});
