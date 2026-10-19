import type { TarOptions, ZipOptions } from 'archiver';

import type { ARCHIVE_FORMATS } from './archive-creator.constants';

export type ArchiveFormat = (typeof ARCHIVE_FORMATS)[number];

/** Passed to archiver: `zlib.level` or `store` for zip, `gzipOptions` for tgz. */
export type ArchiverOptions = TarOptions & ZipOptions;
