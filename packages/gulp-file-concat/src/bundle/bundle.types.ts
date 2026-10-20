import type { BufferFile, Vinyl } from '@zilero/gulp-plugin-factory';
import type { Bundle } from 'magic-string';

import type { BundleText } from '../file-concat.types';

/** An input as it goes into the bundle. */
export type BundleSource = {
  file: BufferFile;
  /** Its name in the bundle and the source map: the path relative to the base, made unique. */
  name: string;
  /** Its text, without a leading byte order mark. */
  content: string;
};

export type ToBundleSourcesInput = {
  files: BufferFile[];
  /** Source names are relative to it: the base of the first file. */
  base: string;
};

export type CreateBundleInput = {
  sources: BundleSource[];
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
  sources: BundleSource[];
};

export type GetSourceNameInput = {
  base: string;
  filePath: string;
};
