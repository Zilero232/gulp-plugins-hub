import type { BufferFile } from '@zilero/gulp-plugin-factory';

export type RevisionEntry = {
  file: BufferFile;
  /** The original path relative to the base, with `/` separators. */
  key: string;
  /** The folder of `key`: `.` or `css`. */
  fromDir: string;
};
