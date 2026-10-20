import type { Vinyl } from '@zilero/gulp-plugin-factory';
import type MagicString from 'magic-string';

import type { Replacer } from '../text-replace.types';

export type Match = {
  text: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
  /** Whether the RegExp has named groups at all: `$<name>` stays as written when it has none. */
  hasNamedGroups: boolean;
  index: number;
};

export type FindMatchesInput = {
  content: string;
  search: string | RegExp;
};

export type ExpandReplacementInput = {
  /** A replacement string with `$&`, `$1`, `$<name>`, `` $` ``, `$'` or `$$` in it. */
  template: string;
  match: Match;
  /** The whole text, for `` $` `` and `$'`. */
  content: string;
};

export type ReplaceMatchesInput = {
  magic: MagicString;
  content: string;
  rule: { search: string | RegExp; replace: string | Replacer };
  file: Vinyl;
};

export type GetReplacementInput = Omit<ReplaceMatchesInput, 'magic'> & {
  match: Match;
};
