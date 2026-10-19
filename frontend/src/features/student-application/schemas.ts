import { z } from 'zod';

export const step1Schema = z.object({
  education_unit_id: z.number(),
  track: z.string().optional(),
});
