export * from './enums';
export * from './content-enums';
export * from './organization-enums';
export * from './process-enums';
export * from './common';
export * from './registration';
export * from './auth';
export * from './event';
export * from './news';
export * from './announcement';
export * from './organization';
export * from './student';
export * from './process';

import { z } from 'zod';

export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
