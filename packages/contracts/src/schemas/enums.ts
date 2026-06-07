import { z } from 'zod';
import { UserRole } from '../enums/user';
import { Permission } from '../enums/user';
import { StudentStatus } from '../enums/student';
import { EventRegistrationStatus } from '../enums/student';
import { AttendanceScanResult } from '../enums/student';

export const userRoleSchema = z.nativeEnum(UserRole);
export const permissionSchema = z.nativeEnum(Permission);
export const studentStatusSchema = z.nativeEnum(StudentStatus);
export const eventRegistrationStatusSchema = z.nativeEnum(EventRegistrationStatus);
export const attendanceScanResultSchema = z.nativeEnum(AttendanceScanResult);
