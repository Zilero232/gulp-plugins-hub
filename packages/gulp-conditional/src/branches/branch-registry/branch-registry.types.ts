import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { BranchHandler, BranchStream } from '../../conditional.types';

type OpenBranchInput = {
  /** The branch's index, or `DEFAULT_BRANCH`. */
  index: number;
  handler: BranchHandler;
  /** Where the branch's output goes: the conditional stream. */
  push: (file: Vinyl) => void;
};

export type BranchRegistry = {
  /** The branch stream for the index, created on its first file. */
  open: (input: OpenBranchInput) => BranchStream;
  /** Throws the first error a branch emitted, if any. */
  throwIfFailed: () => void;
  /** Ends every branch and resolves when they have all finished. */
  closeAll: () => Promise<void>;
  /** Destroys every branch, for a conditional that failed or was destroyed: no branch outlives it. */
  destroyAll: () => void;
};
