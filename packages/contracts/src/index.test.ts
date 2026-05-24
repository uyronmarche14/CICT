import { describe, expect, it } from 'vitest';

import {
  AttendanceScanResult,
  EventRegistrationStatus,
  pushTokenRegistrationRequestSchema,
  studentAttendanceResponseSchema,
  studentEventsResponseSchema,
  studentLoginResponseSchema,
  studentQrPayloadSchema,
  studentRegistrationResponseSchema,
} from './index';

const registration = {
  _id: 'reg_1',
  eventId: 'event_1',
  studentId: 'student_1',
  status: EventRegistrationStatus.REGISTERED,
  registeredAt: '2026-05-24T00:00:00.000Z',
  source: 'self' as const,
};

describe('@cict/contracts student API schemas', () => {
  it('parses a student login response', () => {
    expect(() =>
      studentLoginResponseSchema.parse({
        accessToken: 'access',
        refreshToken: 'refresh',
        student: {
          _id: 'student_1',
          studentNumber: '2026-0001',
          firstName: 'Casey',
          lastName: 'Rivera',
        },
      })
    ).not.toThrow();
  });

  it('parses student event and registration payloads', () => {
    expect(() =>
      studentEventsResponseSchema.parse({
        events: [
          {
            _id: 'event_1',
            title: 'Orientation',
            bodyHtml: '<p>Welcome</p>',
            excerpt: 'Welcome',
            startDate: '2026-05-24T00:00:00.000Z',
            endDate: '2026-05-24T02:00:00.000Z',
            location: 'CICT Hall',
            status: 'published',
            registration,
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      studentRegistrationResponseSchema.parse({ registration })
    ).not.toThrow();
  });

  it('parses attendance, QR, and push token payloads', () => {
    expect(() =>
      studentAttendanceResponseSchema.parse({
        attendanceLogs: [
          {
            _id: 'log_1',
            eventId: {
              _id: 'event_1',
              title: 'Orientation',
              startDate: '2026-05-24T00:00:00.000Z',
              location: 'CICT Hall',
            },
            scanType: 'entry',
            result: AttendanceScanResult.SUCCESS,
            scannedAt: '2026-05-24T00:30:00.000Z',
            createdAt: '2026-05-24T00:30:00.000Z',
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      studentQrPayloadSchema.parse({
        token: 'qr-token',
        registrationId: 'reg_1',
      })
    ).not.toThrow();

    expect(() =>
      pushTokenRegistrationRequestSchema.parse({
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
      })
    ).not.toThrow();
  });
});

