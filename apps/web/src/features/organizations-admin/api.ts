import api from '@/lib/api/axios';

export interface AdminAssignment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface StudentSearchResult {
  _id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
}

export interface OrgFileRecord {
  _id: string;
  organizationId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  visibility: string;
  createdAt: string;
}

export interface OrgQuotaData {
  quota: {
    storageLimitMb: number;
    monthlyUploadLimitMb: number;
    usedStorageBytes: number;
    usedUploadBytesThisMonth: number;
  };
  usagePercent: number;
  monthlyPercent: number;
}

export const organizationsAdminAPI = {
  getAdmins: async (orgId: string) => {
    const { data: res } = await api.get<{ data?: { assignments?: AdminAssignment[] } }>(
      `/organizations/${orgId}/admins`
    );
    return res.data?.assignments ?? [];
  },
  addAdmin: (orgId: string, payload: { userId: string; roleId: string }) =>
    api.post(`/organizations/${orgId}/admins`, payload),
  removeAdmin: (orgId: string, assignmentId: string) =>
    api.delete(`/organizations/${orgId}/admins/${assignmentId}`),
  searchStudents: async (search: string, limit = 10) => {
    const response = await api.get('/admin/students', { params: { search, limit } });
    return (response.data.data?.students ?? []) as StudentSearchResult[];
  },
  getFiles: async (orgId: string, mimeType?: string) => {
    const params = new URLSearchParams();
    if (mimeType) {
      params.set('mimeType', mimeType);
    }
    const { data: res } = await api.get(`/organizations/${orgId}/files?${params}`);
    return res.data as { files: OrgFileRecord[]; total: number };
  },
  getQuota: async (orgId: string) => {
    const { data: res } = await api.get(`/organizations/${orgId}/files/quota`);
    return res.data.data as OrgQuotaData;
  },
};
