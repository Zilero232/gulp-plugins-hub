import type { BufferFile } from '@zilero/gulp-plugin-factory';

import type { RevisionManifest } from '../../asset-revision.types';

export type ReviseFilesInput = {
  /** Every file of the stream, in stream order. */
  files: BufferFile[];
  hashLength: number;
  /** Files that keep their names. */
  isExcluded: (relative: string) => boolean;
  /** Files whose references are rewritten. */
  isRewritable: (file: BufferFile) => boolean;
};

export type RevisedFiles = {
  /** The same files, renamed and rewritten, in stream order. */
  files: BufferFile[];
  manifest: RevisionManifest;
};
