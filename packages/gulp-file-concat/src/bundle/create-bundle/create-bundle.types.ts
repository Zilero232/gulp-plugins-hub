import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { BundleText } from '../../file-concat.types';
import type { BundleSource } from '../bundle.types';

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
