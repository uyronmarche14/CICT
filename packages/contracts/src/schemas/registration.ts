import { z } from 'zod';
import type { StudentRegistration } from '../types/student';
import type { AttendanceLog } from '../types/student';
import { eventRegistrationStatusSchema } from './enums';
import { attendanceScanResultSchema } from './enums';

export const studentRegistrationSchema: z.ZodType<StudentRegistration> = z.object({
  _id: z.string(),
  eventId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      location: z.string(),
      status: z.string(),
    }),
  ]),
  studentId: z.string(),
  status: eventRegistrationStatusSchema,
  qrNonce: z.string().optional(),
  qrIssuedAt: z.string().optional(),
  registeredAt: z.string(),
  cancelledAt: z.string().optional(),
  checkedInAt: z.string().optional(),
  source: z.enum(['self', 'admin', 'walk_in']),
});

export const attendanceLogSchema: z.ZodType<AttendanceLog> = z.object({
  _id: z.string(),
  eventId: z.object({
    _id: z.string(),
    title: z.string(),
    startDate: z.string(),
    location: z.string(),
  }),
  registrationId: z.string().optional(),
  scanType: z.enum(['entry', 'manual']),
  result: attendanceScanResultSchema,
  scannedByAdminId: z.string().optional(),
  scannedAt: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
});
