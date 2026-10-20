import { groupBy } from 'remeda';

import type { RevisionEntry } from '../revision.types';

/**
 * Two files at the same path relative to their bases (`a/css/main.css` and `b/css/main.css` from two `src` bases)
 * would land on one manifest key and one output path: fail, naming both, rather than revise only one.
 */
export const assertUniqueKeys = (entries: RevisionEntry[]): void => {
  const duplicates = Object.values(groupBy(entries, ({ key }) => key)).find((group) => group.length > 1);

  if (duplicates) {
    const [first, second] = duplicates;

    throw new Error(
      `${first.file.path} and ${second?.file.path} are both ${first.key} relative to their base; ` +
        'give them different relative paths or revise them in separate streams'
    );
  }
};
