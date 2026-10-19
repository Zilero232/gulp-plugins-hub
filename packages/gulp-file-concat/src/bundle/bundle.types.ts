import type { BufferFile, Vinyl } from '@zilero/gulp-plugin-factory';
import type { Bundle } from 'magic-string';

import type { BundleText } from '../file-concat.types';

export type CreateBundleInput = {
  files: BufferFile[];
  /** Source names in the bundle are relative to it: the base of the first file. */
  base: string;
  separator: string;
  header?: BundleText;
  footer?: BundleText;
};

export type ResolveBundleTextInput = {
  text: BundleText | undefined;
  files: Vinyl[];
};

export type CreateBundleMapInput = {
  bundle: Bundle;
  files: BufferFile[];
  base: string;
};

export type GetSourceNameInput = {
  base: string;
  filePath: string;
};
