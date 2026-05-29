import { describe, expect, it } from 'vitest';
import { logoutUser } from './authAPI';

describe('authAPI', () => {
  it('logoutUser() succeeds', async () => {
    const result = await logoutUser();
    expect(result).toBeDefined();
  });
});
