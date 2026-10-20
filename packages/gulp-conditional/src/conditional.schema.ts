import { isFunction } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { BranchHandler, ConditionFunction } from './conditional.types';

const handlerSchema = z.custom<BranchHandler>(
  isFunction,
  'Expected a function that returns a stream or an array of them'
);

const pathPatternSchema = z.union([z.string().min(1), z.instanceof(RegExp)]);

const branchSchema = z
  .object({
    /** A boolean, a glob or RegExp (or an array of them) matched against `file.relative`, or a function of the file. */
    condition: z.union(
      [z.boolean(), pathPatternSchema, z.array(pathPatternSchema), z.custom<ConditionFunction>(isFunction)],
      'Expected a boolean, a glob, a RegExp, an array of globs or a function'
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
