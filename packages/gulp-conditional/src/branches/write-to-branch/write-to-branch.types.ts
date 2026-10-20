import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { BranchStream } from '../../conditional.types';

export type WriteToBranchInput = {
  branch: BranchStream;
  file: Vinyl;
};
