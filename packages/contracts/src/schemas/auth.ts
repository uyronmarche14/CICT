import { z } from 'zod';
import type { StudentLoginResponse } from '../types/student';
import { studentProfileSchema } from './student';

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const studentLoginResponseSchema: z.ZodType<StudentLoginResponse> =
  authTokensSchema.extend({
    student: studentProfileSchema,
  });
