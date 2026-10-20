import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { FileText } from '../text-replace.types';

export type ResolveFileTextInput = {
  /** The option name, for the error when a function returns something other than a string. */
  name: string;
  text: FileText | undefined;
  file: Vinyl;
};
