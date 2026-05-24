import api from './axios';
import { Program, Section, YearLevel } from '@/types';

type ProgramResponse = {
  success: boolean;
  data: {
    program: Program;
  };
};

type ProgramsResponse = {
  success: boolean;
  data: {
    programs: Program[];
  };
};

type YearLevelResponse = {
  success: boolean;
  data: {
    yearLevel: YearLevel;
  };
};

type YearLevelsResponse = {
  success: boolean;
  data: {
    yearLevels: YearLevel[];
  };
};

type SectionResponse = {
  success: boolean;
  data: {
    section: Section;
  };
};

type SectionsResponse = {
  success: boolean;
  data: {
    sections: Section[];
  };
};

export const academicAPI = {
  getPrograms: async () => {
    const response = await api.get<ProgramsResponse>('/admin/academic/programs');
    return response.data.data.programs;
  },

  createProgram: async (payload: Partial<Program> & { code: string; name: string }) => {
    const response = await api.post<ProgramResponse>('/admin/academic/programs', payload);
    return response.data.data.program;
  },

  updateProgram: async (id: string, payload: Partial<Program>) => {
    const response = await api.put<ProgramResponse>(`/admin/academic/programs/${id}`, payload);
    return response.data.data.program;
  },

  getYearLevels: async () => {
    const response = await api.get<YearLevelsResponse>('/admin/academic/year-levels');
    return response.data.data.yearLevels;
  },

  createYearLevel: async (
    payload: Partial<YearLevel> & { code: string; label: string; numericLevel: number }
  ) => {
    const response = await api.post<YearLevelResponse>('/admin/academic/year-levels', payload);
    return response.data.data.yearLevel;
  },

  updateYearLevel: async (id: string, payload: Partial<YearLevel>) => {
    const response = await api.put<YearLevelResponse>(
      `/admin/academic/year-levels/${id}`,
      payload
    );
    return response.data.data.yearLevel;
  },

  getSections: async () => {
    const response = await api.get<SectionsResponse>('/admin/academic/sections');
    return response.data.data.sections;
  },

  createSection: async (
    payload: Pick<Section, 'name' | 'displayName' | 'isActive'> & {
      programId: string;
      yearLevelId: string;
    }
  ) => {
    const response = await api.post<SectionResponse>('/admin/academic/sections', payload);
    return response.data.data.section;
  },

  updateSection: async (id: string, payload: Partial<Section> & { programId?: string; yearLevelId?: string }) => {
    const response = await api.put<SectionResponse>(`/admin/academic/sections/${id}`, payload);
    return response.data.data.section;
  },
};
