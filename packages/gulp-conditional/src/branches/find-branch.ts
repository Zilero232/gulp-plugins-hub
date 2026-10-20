import type { FindBranchInput } from './branches.types';

import { DEFAULT_BRANCH } from '../conditional.constants';

/** The index of the first predicate that holds for the file, or `DEFAULT_BRANCH`. */
export const findBranch = async ({ predicates, file }: FindBranchInput): Promise<number> => {
  for (const [index, predicate] of predicates.entries()) {
    if (await predicate({ file })) {
      return index;
    }
  }

  return DEFAULT_BRANCH;
};
