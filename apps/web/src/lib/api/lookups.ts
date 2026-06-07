import api from './axios';

export interface LookupItem {
  id: string;
  label: string;
  value: string;
  description?: string;
  status?: string;
  badge?: string;
  imageUrl?: string;
  meta?: Record<string, unknown>;
}

export interface LookupResponse {
  items: LookupItem[];
  total: number;
  activeCount: number;
  inactiveCount: number;
  suggested: LookupItem[];
  source: string;
}

export interface ReferenceDataGroup {
  key: string;
  items: LookupItem[];
  total: number;
  activeCount: number;
  inactiveCount: number;
  suggested: LookupItem[];
}

export type LookupKind =
  | 'organizations'
  | 'users'
  | 'students'
  | 'org-members'
  | 'org-officers'
  | 'roles'
  | 'programs'
  | 'year-levels'
  | 'sections'
  | 'news'
  | 'announcements'
  | 'events'
  | 'tasks'
  | 'meetings'
  | 'process-templates'
  | 'org-templates'
  | 'content';

export interface LookupParams {
  search?: string;
  limit?: number;
  excludeOrgId?: string;
  activeOnly?: boolean;
  orgId?: string;
  type?: 'news' | 'announcement' | 'event';
  status?: string;
  ownerType?: string;
  ids?: string | string[];
  programId?: string;
  yearLevelId?: string;
}

const toQuery = (params: LookupParams = {}) => {
  const query: Record<string, string | number | boolean> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        query[key] = value.join(',');
      }
      return;
    }

    if (value !== undefined && value !== '') {
      query[key] = value;
    }
  });

  return query;
};

export const lookupsAPI = {
  get: async (kind: LookupKind, params?: LookupParams): Promise<LookupResponse> => {
    const response = await api.get<{ success: boolean; data: LookupResponse }>(
      `/admin/lookups/${kind}`,
      { params: toQuery(params) }
    );
    return response.data.data;
  },

  getReferenceData: async (): Promise<Record<string, ReferenceDataGroup>> => {
    const response = await api.get<{
      success: boolean;
      data: { groups: Record<string, ReferenceDataGroup> };
    }>('/admin/lookups/reference-data');
    return response.data.data.groups;
  },
};
