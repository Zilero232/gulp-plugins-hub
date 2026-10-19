import type { ReplaceMatchesInput } from './replace.types';

import { expandReplacement } from './expand-replacement';
import { findMatches } from './find-matches';

/**
 * Writes one rule's replacements into the MagicString, which keeps track of where every character came from.
 * A string replacement for a string search is literal; for a RegExp its `$` patterns are filled in.
 */
export const replaceMatches = async ({ magic, content, rule, file }: ReplaceMatchesInput): Promise<void> => {
  for (const match of findMatches({ content, search: rule.search })) {
    const replacement =
      typeof rule.replace === 'function'
        ? await rule.replace({
            match: match.text,
            groups: match.groups,
            namedGroups: match.namedGroups,
            offset: match.index,
            file
          })
        : typeof rule.search === 'string'
          ? rule.replace
          : expandReplacement({ template: rule.replace, match, content });

    if (match.text.length === 0) {
      magic.appendLeft(match.index, replacement);
    } else {
      magic.overwrite(match.index, match.index + match.text.length, replacement || '');
    }
  }
};
