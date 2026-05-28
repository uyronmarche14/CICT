import api from './axios';
import type { OrganizationMember, Organization } from '@/types';

interface PublicMemberResponse {
  success: boolean;
  data: {
    member: OrganizationMember;
    organization: Pick<Organization, 'id' | 'name' | 'fullName' | 'color' | 'mission' | 'vision' | 'values' | 'description'>;
    teamMembers: OrganizationMember[];
  };
}

export const memberAPI = {
  getById: async (memberId: string) => {
    const response = await api.get<PublicMemberResponse>(`/members/${memberId}`);
    return response.data.data;
  },
};
