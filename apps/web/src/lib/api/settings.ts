import api from './axios';

export interface SettingsMap {
  general: GeneralSettings;
  maintenance: MaintenanceSettings;
  features: FeatureSettings;
  academic: AcademicSettings;
  security: SecuritySettings;
  uploads: UploadSettings;
  notifications: NotificationSettings;
  [key: string]: Record<string, unknown>;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  footerText: string;
  [key: string]: unknown;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  [key: string]: unknown;
}

export interface FeatureSettings {
  selfRegistration: boolean;
  qrScanning: boolean;
  pushNotifications: boolean;
  orgApplications: boolean;
  [key: string]: unknown;
}

export interface AcademicSettings {
  currentSemester: string;
  currentAcademicYear: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  [key: string]: unknown;
}

export interface SecuritySettings {
  passwordMinLength: number;
  studentSessionMinutes: number;
  adminSessionMinutes: number;
  [key: string]: unknown;
}

export interface UploadSettings {
  maxFileSizeMb: number;
  allowedTypes: string[];
  cloudinaryFolder: string;
  [key: string]: unknown;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  [key: string]: unknown;
}

export const settingsAPI = {
  async getAll(): Promise<SettingsMap> {
    const res = await api.get('/admin/settings');
    return res.data.data;
  },

  async getGroup(group: string): Promise<Record<string, unknown>> {
    const res = await api.get(`/admin/settings/${group}`);
    return res.data.data;
  },

  async updateGroup(group: string, values: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await api.put(`/admin/settings/${group}`, values);
    return res.data.data;
  },
};
