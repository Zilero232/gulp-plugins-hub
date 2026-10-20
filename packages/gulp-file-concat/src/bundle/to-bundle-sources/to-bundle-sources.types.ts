import type { BufferFile } from '@zilero/gulp-plugin-factory';

export type ToBundleSourcesInput = {
  files: BufferFile[];
  /** Source names are relative to it: the base of the first file. */
  base: string;
};
