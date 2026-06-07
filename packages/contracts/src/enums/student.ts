export const StudentStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const EventRegistrationStatus = {
  RESERVED: 'reserved',
  REGISTERED: 'registered',
  CANCELLED: 'cancelled',
  CHECKED_IN: 'checked_in',
  DENIED: 'denied',
} as const;
export type EventRegistrationStatus =
  (typeof EventRegistrationStatus)[keyof typeof EventRegistrationStatus];

export const AttendanceScanResult = {
  SUCCESS: 'success',
  DUPLICATE: 'duplicate',
  NOT_REGISTERED: 'not_registered',
  EVENT_FULL: 'event_full',
  NOT_ELIGIBLE: 'not_eligible',
  REGISTRATION_CLOSED: 'registration_closed',
  INVALID_QR: 'invalid_qr',
  DENIED: 'denied',
} as const;
export type AttendanceScanResult =
  (typeof AttendanceScanResult)[keyof typeof AttendanceScanResult];
