import { organizationService } from '@/services/organizationService';

export const studentOrganizationsFeatureAPI = {
  list: () => organizationService.getAll(),
};
