import api from './axios';

interface OrgTemplate {
  _id: string;
  name: string;
  description?: string;
  defaultRoles?: Array<{ name: string; permissions: string[] }>;
  defaultColorScheme?: { primary: string; secondary: string; accent: string };
  defaultStructure?: { committees: string[]; programs: string[] };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const orgTemplatesAPI = {
  list: async () => {
    const res = await api.get<{ success: boolean; data: OrgTemplate[] }>('/org-templates');
    return res.data.data;
  },
  get: async (templateId: string) => {
    const res = await api.get<{ success: boolean; data: OrgTemplate }>(`/org-templates/${templateId}`);
    return res.data.data;
  },
  create: async (data: Partial<OrgTemplate>) => {
    const res = await api.post<{ success: boolean; data: OrgTemplate }>('/org-templates', data);
    return res.data.data;
  },
  update: async (templateId: string, data: Partial<OrgTemplate>) => {
    const res = await api.put<{ success: boolean; data: OrgTemplate }>(`/org-templates/${templateId}`, data);
    return res.data.data;
  },
  delete: async (templateId: string) => {
    await api.delete(`/org-templates/${templateId}`);
  },
  apply: async (templateId: string, organizationId: string) => {
    const res = await api.post<{ success: boolean; data: { applied: boolean; templateName: string } }>(`/org-templates/${templateId}/apply`, { organizationId });
    return res.data.data;
  },
};
