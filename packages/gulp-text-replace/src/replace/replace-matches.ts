import { isString } from 'remeda';
import { match as matchPattern, P } from 'ts-pattern';

import type { GetReplacementInput, ReplaceMatchesInput } from './replace.types';

import { expandReplacement } from './expand-replacement';
import { findMatches } from './find-matches';

/**
 * The replacement for one match. A replacer's result is converted with `String()` like `String.prototype.replace`
 * does, except `undefined`: a replacer that forgot to `return` would otherwise write `undefined` into the file.
 */
const getReplacement = async ({ match, content, rule, file }: GetReplacementInput): Promise<string> => {
  if (isString(rule.replace)) {
    return isString(rule.search) ? rule.replace : expandReplacement({ template: rule.replace, match, content });
  }

  const result: unknown = await rule.replace({
    match: match.text,
    groups: match.groups,
    namedGroups: match.namedGroups,
    offset: match.index,
    file
  });

  return matchPattern(result)
    .with(P.string, (text) => text)
    .with(undefined, () => {
      throw new TypeError(`The replacer for ${String(rule.search)} returned undefined; return the replacement text`);
    })
    .otherwise(String);
};

/**
 * Writes one rule's replacements into the MagicString, which keeps track of where every character came from.
 * A string replacement for a string search is literal; for a RegExp its `$` patterns are filled in.
 */
export const replaceMatches = async ({ magic, content, rule, file }: ReplaceMatchesInput): Promise<void> => {
  for (const match of findMatches({ content, search: rule.search })) {
    const replacement = await getReplacement({ match, content, rule, file });

    if (match.text.length === 0) {
      magic.appendLeft(match.index, replacement);
    } else {
      magic.overwrite(match.index, match.index + match.text.length, replacement);
    }
  }
};
