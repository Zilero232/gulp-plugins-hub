import type { BufferFile } from '@zilero/gulp-plugin-factory';

import type { RevisionManifest } from '../asset-revision.types';

export type HashContentsInput = {
  contents: Buffer;
  /** Characters of the hex digest to keep. */
  length: number;
};

export type RevisePathInput = {
  /** Relative to the base, with `/` separators. */
  relative: string;
  hash: string;
};

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

export type RevisionEntry = {
  file: BufferFile;
  /** The original path relative to the base, with `/` separators. */
  key: string;
  /** The folder of `key`: `.` or `css`. */
  fromDir: string;
};
