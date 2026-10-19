import { z } from 'zod';

export const teacherStep1Schema = z.object({
  applied_position: z.string().min(1),
});
