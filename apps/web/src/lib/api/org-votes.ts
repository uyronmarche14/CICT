import api from './axios';

interface Vote {
  _id: string;
  organizationId: string;
  title: string;
  description?: string;
  positions: Array<{ title: string; description?: string; maxSelections: number }>;
  candidates: Array<{ name: string; position: string; photo?: string; bio?: string }>;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BallotResult {
  vote: Vote;
  results: Record<string, Record<string, number>>;
  totalBallots: number;
}

export const orgVotesAPI = {
  list: async (orgId: string) => {
    const res = await api.get<{ success: boolean; data: Vote[] }>(`/organizations/${orgId}/votes`);
    return res.data.data;
  },
  get: async (orgId: string, voteId: string) => {
    const res = await api.get<{ success: boolean; data: Vote }>(`/organizations/${orgId}/votes/${voteId}`);
    return res.data.data;
  },
  create: async (orgId: string, data: Partial<Vote>) => {
    const res = await api.post<{ success: boolean; data: Vote }>(`/organizations/${orgId}/votes`, data);
    return res.data.data;
  },
  update: async (orgId: string, voteId: string, data: Partial<Vote>) => {
    const res = await api.put<{ success: boolean; data: Vote }>(`/organizations/${orgId}/votes/${voteId}`, data);
    return res.data.data;
  },
  delete: async (orgId: string, voteId: string) => {
    await api.delete(`/organizations/${orgId}/votes/${voteId}`);
  },
  castBallot: async (orgId: string, voteId: string, selections: { position: string; candidateIds: string[] }[]) => {
    const res = await api.post<{ success: boolean; data: unknown }>(`/organizations/${orgId}/votes/${voteId}/cast`, { selections });
    return res.data.data;
  },
  getResults: async (orgId: string, voteId: string) => {
    const res = await api.get<{ success: boolean; data: BallotResult }>(`/organizations/${orgId}/votes/${voteId}/results`);
    return res.data.data;
  },
};
