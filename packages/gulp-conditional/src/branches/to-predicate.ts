import { createPathMatcher } from '@zilero/gulp-plugin-factory';
import { isBoolean, isFunction } from 'remeda';

import type { Condition, ConditionFunction } from '../conditional.types';

/** Turns any form of condition into a function of the file; globs and RegExps are compiled once, here. */
export const toPredicate = (condition: Condition): ConditionFunction => {
  if (isBoolean(condition)) {
    return () => condition;
  }

  if (isFunction(condition)) {
    return condition;
  }

  const matches = createPathMatcher({ patterns: [condition].flat() });

  return ({ file }) => matches(file.relative);
};
