import { z } from 'zod';

import { transformStreamSchema } from '@/shared/schemas';

// Schema for handler.
const handlerSchema = z.object({
  condition: z.boolean().or(z.function().args().returns(z.boolean())),
  handler: z.function().returns(transformStreamSchema)
});

// Main schema for plugin.
export const gulpConditionalSchema = z.object({
  handlers: z.array(handlerSchema),
  defaultHandler: z.function().returns(transformStreamSchema).optional()
}).strict();

// Export types.
export type GulpConditionalOptions = z.infer<typeof gulpConditionalSchema>;
