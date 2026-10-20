import { isFunction, isRelativePathInside } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { RenameFunction } from './refilename.types';

import { KEY_HINTS } from './refilename.constants';

const describeUnknownKey = (key: string): string =>
  Object.hasOwn(KEY_HINTS, key) ? `"${key}" (use ${KEY_HINTS[key]})` : `"${key}"`;

/** Part of a file name: a folder separator would move the file, possibly out of the base. */
const fileNamePartSchema = z
  .string()
  .refine((part) => !/[/\\]/.test(part), 'Expected part of a file name, without / or \\');

export const renameObjectSchema = z.strictObject(
  {
    /** New directory, relative to `file.base`; `.` is the base itself. */
    dirname: z
      .string()
      .refine((dirname) => dirname === '.' || isRelativePathInside(dirname), 'Expected a folder inside the base')
      .optional(),
    /** New file name without the extension. */
    stem: fileNamePartSchema
      .min(1, 'Expected a file name without the extension')
      .refine((stem) => stem !== '.' && stem !== '..', 'Expected a file name without the extension')
      .optional(),
    /** New extension; the leading dot is optional and `''` removes the extension. */
    extname: z
      .string()
      .regex(/^(?:\.?[^./\\]+(?:\.[^./\\]+)*)?$/, 'Expected an extension, like .js or js, or an empty string')
      .optional(),
    /** Added before the stem. */
    prefix: fileNamePartSchema.optional(),
    /** Added after the stem, before the extension. */
    suffix: fileNamePartSchema.optional()
  },
  {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? `Unknown key ${issue.keys.map(describeUnknownKey).join(', ')}; expected dirname, stem, extname, prefix or suffix`
        : undefined
  }
);

export const refilenameOptionsSchema = z.union([
  z
    .string()
    .min(1, 'Expected a file name')
    .refine((name) => !/[/\\]/.test(name), 'Expected a file name without a folder; use { dirname } to move files')
    .refine((name) => name !== '.' && name !== '..', 'Expected a file name'),
  renameObjectSchema,
  z.custom<RenameFunction>(isFunction, 'Expected a function')
]);

export type RenameObject = z.input<typeof renameObjectSchema>;

/** A new file name (`'bundle.js'`), an object of changes or a function of the path parts. */
export type RefilenameOptions = z.input<typeof refilenameOptionsSchema>;
