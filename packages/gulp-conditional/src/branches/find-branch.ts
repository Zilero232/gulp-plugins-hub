import type { FindBranchInput } from './branches.types';

import { DEFAULT_BRANCH } from '../conditional.constants';

/** The index of the first condition that holds for the file, or `DEFAULT_BRANCH`. */
export const findBranch = async ({ conditions, file }: FindBranchInput): Promise<number> => {
  for (const [index, condition] of conditions.entries()) {
    const holds = typeof condition === 'function' ? await condition({ file }) : condition;

    if (holds) {
      return index;
    }
  }

  return DEFAULT_BRANCH;
};
