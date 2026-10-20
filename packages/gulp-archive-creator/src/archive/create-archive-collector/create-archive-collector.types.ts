import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { ArchiveFormat, ArchiverOptions } from '../../archive-creator.types';

export type CreateArchiveCollectorInput = {
  format: ArchiveFormat;
  options?: ArchiverOptions;
  /** The date of every entry; default each file's `stat.mtime`, else a fixed date. */
  modifiedTime?: Date;
};

export type ArchiveCollector = {
  /** The first file added, whose cwd and base the archive takes. */
  readonly first: Vinyl | undefined;
  /** Adds a file, a directory entry or streamed contents. Throws the archive's first error, if any. */
  add: (file: Vinyl) => void;
  /** Finishes the archive and resolves with its bytes; rejects with the archive's first error. */
  finish: () => Promise<Buffer>;
};
