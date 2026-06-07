export const OrganizationStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;
export type OrganizationStatus = (typeof OrganizationStatus)[keyof typeof OrganizationStatus];

export const OrganizationType = {
  ACADEMIC: 'academic',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  SPECIAL_INTEREST: 'special_interest',
  OTHER: 'other',
} as const;
export type OrganizationType = (typeof OrganizationType)[keyof typeof OrganizationType];

export const MembershipStatus = {
  APPLIED: 'applied',
  INVITED: 'invited',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ALUMNI: 'alumni',
  REJECTED: 'rejected',
  RESIGNED: 'resigned',
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const MemberType = {
  OFFICER: 'officer',
  GENERAL: 'general',
  ALUMNI: 'alumni',
  HONORARY: 'honorary',
  ADVISOR: 'advisor',
} as const;
export type MemberType = (typeof MemberType)[keyof typeof MemberType];
