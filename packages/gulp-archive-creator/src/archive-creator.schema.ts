import { isObject, isRelativePathInside } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { ArchiverOptions } from './archive-creator.types';

import { getExtensionFormat } from './archive';
import { ARCHIVE_FORMATS } from './archive-creator.constants';

export const archiveCreatorOptionsSchema = z
  .object({
    /**
     * The archive's path relative to the output folder, `site.zip` or `releases/site.tar.gz`. Without an
     * extension the format's own is added. Default `archive` plus the extension.
     */
    name: z
      .string()
      .min(1, 'Expected a file name')
      .refine(isRelativePathInside, 'Expected a path inside the output folder')
      .default('archive'),
    /** Default: from the extension of `name` (`.zip`, `.tar`, `.tgz`, `.tar.gz`), else zip. */
    format: z.enum(ARCHIVE_FORMATS).optional(),
    /** Passed to archiver: `zlib.level` or `store` for zip, `gzipOptions` for tgz. */
    archiverOptions: z.custom<ArchiverOptions>(isObject, 'Expected an object').optional(),
    /** Emit an empty archive when the stream had no files. Default false: nothing is emitted. */
    emptyArchive: z.boolean().default(false),
    /** Add an entry for each directory in the stream (`src('**')` without `nodir`). Default false. */
    directories: z.boolean().default(false),
    /**
     * The modification time of every entry, for archives that are the same byte for byte on every build.
     * Default: each file's own `stat.mtime`, and 1980-01-01 for files without a stat.
     */
    modifiedTime: z.date().optional()
  })
  .strict()
  .superRefine(({ name, format }, context) => {
    const fromExtension = getExtensionFormat(name);

    if (format && fromExtension && format !== fromExtension) {
      context.addIssue({
        code: 'custom',
        path: ['format'],
        message: `${name} is a ${fromExtension} name, but format is ${format}: change one of them or drop format`
      });
    }
  });

export type ArchiveCreatorOptions = z.input<typeof archiveCreatorOptionsSchema>;
