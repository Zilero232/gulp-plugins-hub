import { describe, expect, it } from 'vitest';

import { expandReplacement } from '../expand-replacement';
import { findMatches } from '../find-matches';

const TEMPLATES = [
  '$<toString>',
  '$&',
  '$1',
  '$2',
  '$01',
  '$10',
  '$0',
  '$$',
  "$'",
  '$`',
  '$<word>',
  '$<missing>',
  '$<',
  '$',
  '[$1$2]'
];

const SEARCHES = [/(b)/, /(?<word>b)(c)?/, /(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)/, /b/];

describe('expandReplacement', () => {
  it.each(SEARCHES)('fills in every $ pattern like String.prototype.replace for %s', (search) => {
    const content = 'x' + 'abcdefghij' + 'y';
    const [match] = findMatches({ content, search });

    for (const template of TEMPLATES) {
      const expected = content.replace(search, template);

      const actual = match
        ? content.slice(0, match.index) +
          expandReplacement({ template, match, content }) +
          content.slice(match.index + match.text.length)
        : content;

      expect(actual, template).toBe(expected);
    }
  });
});
