export const DEFAULT_SETTINGS = {
  general: {
    siteName: 'CICT',
    siteDescription: 'College of Information and Communication Technology',
    contactEmail: '',
    footerText: '',
  },
  maintenance: {
    enabled: false,
    message: 'The system is currently undergoing scheduled maintenance. Please check back later.',
  },
  features: {
    selfRegistration: true,
    qrScanning: true,
    pushNotifications: false,
    orgApplications: true,
  },
  academic: {
    currentSemester: '',
    currentAcademicYear: '',
    enrollmentStart: '',
    enrollmentEnd: '',
  },
  security: {
    passwordMinLength: 8,
    studentSessionMinutes: 15,
    adminSessionMinutes: 10080,
  },
  uploads: {
    maxFileSizeMb: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    cloudinaryFolder: 'cict-crm',
  },
  notifications: {
    emailEnabled: false,
    pushEnabled: false,
    smsEnabled: false,
  },
} as const;

export type SettingsGroup = keyof typeof DEFAULT_SETTINGS;
export type SettingsGroupValue<T extends SettingsGroup> = (typeof DEFAULT_SETTINGS)[T];

export const SETTINGS_GROUPS = Object.keys(DEFAULT_SETTINGS) as SettingsGroup[];
