import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { TargetResolver } from '../../file-changed.types';

export type GetTargetPathInput = {
  file: Vinyl;
  /** The absolute destination folder. */
  destination: string;
  extname?: string;
  target?: TargetResolver;
};
