import { client } from '@/services/api/client';
import type { OrganizationMembership } from '@/types/models';

export const membershipApi = {
  async getMyMemberships() {
    const response = await client.get<{ success: boolean; data: { memberships: OrganizationMembership[] } }>(
      '/student/memberships'
    );
    return response.data.data.memberships;
  },

  async applyToOrg(orgId: string): Promise<OrganizationMembership> {
    const response = await client.post<{ success: boolean; data: { membership: OrganizationMembership } }>(
      `/student/organizations/${orgId}/apply`,
      { message: '' }
    );
    return response.data.data.membership;
  },

  async resignFromOrg(membershipId: string): Promise<OrganizationMembership> {
    const response = await client.post<{ success: boolean; data: { membership: OrganizationMembership } }>(
      `/student/memberships/${membershipId}/resign`
    );
    return response.data.data.membership;
  },
};
