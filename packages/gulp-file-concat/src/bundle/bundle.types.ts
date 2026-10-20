import type { BufferFile } from '@zilero/gulp-plugin-factory';

/** An input as it goes into the bundle. */
export type BundleSource = {
  file: BufferFile;
  /** Its name in the bundle and the source map: the path relative to the base, made unique. */
  name: string;
  /** Its text, without a leading byte order mark. */
  content: string;
};
