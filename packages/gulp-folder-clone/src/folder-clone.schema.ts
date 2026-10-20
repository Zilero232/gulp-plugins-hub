import { isFunction, isRelativePathInside, toPosixPath } from '@zilero/gulp-plugin-factory';
import path from 'node:path';
import { uniqueBy } from 'remeda';
import { z } from 'zod';

import type { CloneHook } from './folder-clone.types';

const dirSchema = z
  .string()
  .min(1, 'Expected a folder name')
  .refine(isRelativePathInside, 'Expected a folder inside file.base, not the base itself or a path outside it');

/** `backup`, `backup/` and `./backup` are one folder: two copies would be written to the same path. */
const toFolderKey = (dir: string): string => toPosixPath(path.normalize(dir)).replace(/\/+$/, '');

export const folderCloneOptionsSchema = z
  .object({
    /** One or more folders, relative to `file.base`, that receive a copy of every file. Each folder once. */
    dirs: z.union([
      dirSchema,
      z
        .array(dirSchema)
        .min(1, 'Add at least one folder')
        .refine((dirs) => uniqueBy(dirs, toFolderKey).length === dirs.length, 'Each folder may be listed only once')
    ]),
    /** Emit the original file as well as the copies. Default true. */
    keepOriginal: z.boolean().default(true),
    /** Runs for every copy, to change, replace or skip it; may be async. */
    onClone: z.custom<CloneHook>(isFunction, 'Expected a function').optional()
  })
  .strict();

export type FolderCloneOptions = z.input<typeof folderCloneOptionsSchema>;
