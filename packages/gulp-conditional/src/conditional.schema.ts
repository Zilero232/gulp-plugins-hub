import { isFunction } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { BranchHandler, Condition } from './conditional.types';

const handlerSchema = z.custom<BranchHandler>(
  isFunction,
  'Expected a function that returns a stream or an array of them'
);

const branchSchema = z
  .object({
    /** A boolean, or a function of the file. */
    condition: z.custom<Condition>(
      (value) => typeof value === 'boolean' || isFunction(value),
      'Expected a boolean or a function'
    ),
    /** Creates the stream the matching files go through. */
    handler: handlerSchema
  })
  .strict();

export const conditionalOptionsSchema = z
  .object({
    /** Checked in order for every file; the first branch whose condition holds gets it. */
    handlers: z.array(branchSchema).min(1, 'Add at least one handler'),
    /** For the files no condition matched. Without it they pass through untouched. */
    defaultHandler: handlerSchema.optional()
  })
  .strict();

export type ConditionalBranch = z.input<typeof branchSchema>;
export type ConditionalOptions = z.input<typeof conditionalOptionsSchema>;
