import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { ConditionFunction } from '../../conditional.types';

export type FindBranchInput = {
  /** One per branch, in order: the conditions turned into functions by `toPredicate`. */
  predicates: ConditionFunction[];
  file: Vinyl;
};
