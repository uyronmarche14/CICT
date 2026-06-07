import { describe, expect, it } from 'vitest';
import { studentAuthAPI } from './student';

describe('studentAuthAPI', () => {
  it('login() returns auth profile with tokens', async () => {
    const result = await studentAuthAPI.login('2020-00001', 'password123');
    expect(result.accessToken).toBe('test-access-token');
    expect(result.refreshToken).toBe('test-refresh-token');
    expect(result.student.studentNumber).toBe('2020-00001');
  });

  it('me() returns student profile when authenticated', async () => {
    const result = await studentAuthAPI.me();
    expect(result.studentNumber).toBe('2020-00001');
    expect(result.firstName).toBe('Test');
  });

  it('logout() calls backend and resolves', async () => {
    await expect(studentAuthAPI.logout()).resolves.not.toThrow();
  });
});
