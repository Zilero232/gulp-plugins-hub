import type { ArchiveFormat } from '../../archive-creator.types';

export type ResolveArchiveInput = {
  name: string;
  format?: ArchiveFormat;
};

export type ResolvedArchive = {
  format: ArchiveFormat;
  /** The name with the format's extension when it had none. */
  fileName: string;
};
