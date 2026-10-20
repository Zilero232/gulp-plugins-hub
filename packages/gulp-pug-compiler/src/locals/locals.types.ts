import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { TemplateData, TemplateDataFunction } from '../pug-compiler.types';

export type ResolveLocalsInput = {
  file: Vinyl;
  /** The `data` option. */
  data?: TemplateData | TemplateDataFunction;
};
