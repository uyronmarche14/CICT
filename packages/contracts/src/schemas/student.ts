import { z } from 'zod';
import type { StudentProfile } from '../types/student';
import type { StudentRegistrationResponse } from '../types/student';
import type { StudentRegistrationsResponse } from '../types/student';
import type { StudentProfileResponse } from '../types/student';
import type { StudentQrPayload } from '../types/student';
import type { StudentAttendanceResponse } from '../types/student';
import type { PushTokenRegistrationRequest } from '../types/student';
import type { PushTokenUnregistrationRequest } from '../types/student';
import { studentStatusSchema } from './enums';
import { studentRegistrationSchema } from './registration';
import { attendanceLogSchema } from './registration';

export const studentProfileSchema: z.ZodType<StudentProfile> = z.object({
  id: z.string().optional(),
  _id: z.string(),
  studentNumber: z.string(),
  email: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),
  profilePhoto: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  aboutMe: z.string().optional(),
  status: z.union([studentStatusSchema, z.string()]).optional(),
  isActive: z.boolean().optional(),
  qrVersion: z.number().optional(),
  programId: z.union([z.string(), z.record(z.unknown())]).optional(),
  yearLevelId: z.union([z.string(), z.record(z.unknown())]).optional(),
  sectionId: z.union([z.string(), z.record(z.unknown())]).optional(),
  enrollmentDate: z.string().optional(),
  expectedGraduationYear: z.number().optional(),
  previousSchool: z.string().optional(),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  guardianRelationship: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  notificationPreferences: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }).optional(),
});

export const studentProfileResponseSchema: z.ZodType<StudentProfileResponse> = z.object({
  student: studentProfileSchema,
});

export const studentRegistrationResponseSchema: z.ZodType<StudentRegistrationResponse> =
  z.object({
    registration: studentRegistrationSchema.nullable(),
  });

export const studentRegistrationsResponseSchema: z.ZodType<StudentRegistrationsResponse> =
  z.object({
    registrations: z.array(studentRegistrationSchema),
  });

export const studentQrPayloadSchema: z.ZodType<StudentQrPayload> = z.object({
  token: z.string(),
  registrationId: z.string(),
});

export const studentAttendanceResponseSchema: z.ZodType<StudentAttendanceResponse> =
  z.object({
    attendanceLogs: z.array(attendanceLogSchema),
  });

export const pushTokenRegistrationRequestSchema: z.ZodType<PushTokenRegistrationRequest> =
  z.object({
    token: z.string().min(1),
    platform: z.enum(['ios', 'android']),
  });

export const pushTokenUnregistrationRequestSchema: z.ZodType<PushTokenUnregistrationRequest> =
  z.object({
    token: z.string().min(1),
  });

