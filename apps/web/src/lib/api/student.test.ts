import { describe, expect, it } from 'vitest';
import { studentAuthAPI, studentMembershipAPI } from './student';

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

describe('studentMembershipAPI', () => {
  it('getMyMemberships() returns array of memberships', async () => {
    const memberships = await studentMembershipAPI.getMyMemberships();
    expect(Array.isArray(memberships)).toBe(true);
    expect(memberships.length).toBeGreaterThan(0);
    expect(memberships[0]._id).toBe('membership-1');
    expect(memberships[0].status).toBe('active');
  });

  it('applyToOrg() returns new membership', async () => {
    const membership = await studentMembershipAPI.applyToOrg('org-1', 'I want to join');
    expect(membership._id).toBe('membership-new');
    expect(membership.organizationId).toBe('org-1');
    expect(membership.status).toBe('active');
  });

  it('applyToOrg() works without optional message', async () => {
    const membership = await studentMembershipAPI.applyToOrg('org-2');
    expect(membership._id).toBe('membership-new');
    expect(membership.organizationId).toBe('org-2');
  });

  it('resignFromOrg() returns updated membership', async () => {
    const membership = await studentMembershipAPI.resignFromOrg('membership-1');
    expect(membership._id).toBe('membership-1');
    expect(membership.status).toBe('resigned');
  });
});
