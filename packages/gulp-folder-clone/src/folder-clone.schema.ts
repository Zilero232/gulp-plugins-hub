import { isFunction, isRelativePathInside } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { CloneHook } from './folder-clone.types';

const dirSchema = z
  .string()
  .min(1, 'Expected a folder name')
  .refine(isRelativePathInside, 'Expected a folder inside file.base, not the base itself or a path outside it');

export const folderCloneOptionsSchema = z
  .object({
    /** One or more folders, relative to `file.base`, that receive a copy of every file. */
    dirs: z.union([dirSchema, z.array(dirSchema).min(1, 'Add at least one folder')]),
    /** Emit the original file as well as the copies. Default true. */
    keepOriginal: z.boolean().default(true),
    /** Runs for every copy, to change or skip it. */
    onClone: z.custom<CloneHook>(isFunction, 'Expected a function').optional()
  })
  .strict();

export type FolderCloneOptions = z.input<typeof folderCloneOptionsSchema>;
