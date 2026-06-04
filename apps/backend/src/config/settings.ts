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
  referenceData: {
    taskCategories: 'General\nEvent\nAcademic\nAdmin\nOther',
    budgetCategories: 'Supplies\nEquipment\nEvents\nFood\nTransportation\nMarketing\nVenue\nUtilities\nMiscellaneous\nDonations\nDues\nOther',
    resourceTypes: 'venue\nequipment\nbudget\npersonnel\nother',
    partnershipTypes: 'partner\nsponsor\nacademic\ncommunity\nindustry\nother',
    mentorshipFocusAreas: 'leadership\nevent planning\ndocumentation\nfinance\nmembership\ntechnical skills',
    committees: 'Executive\nFinance\nEvents\nDocumentation\nCreatives\nMembership\nTechnical',
    officerPositions: 'President\nVice President\nSecretary\nTreasurer\nAuditor\nPublic Relations Officer',
    contentCategories: 'news\nfeature\nopinion\nannouncement\nevent\ngeneral',
  },
} as const;

export type SettingsGroup = keyof typeof DEFAULT_SETTINGS;
export type SettingsGroupValue<T extends SettingsGroup> = (typeof DEFAULT_SETTINGS)[T];

export const SETTINGS_GROUPS = Object.keys(DEFAULT_SETTINGS) as SettingsGroup[];
