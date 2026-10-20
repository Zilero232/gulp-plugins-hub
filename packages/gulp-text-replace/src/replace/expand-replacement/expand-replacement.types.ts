import type { Match } from '../replace.types';

export type ExpandReplacementInput = {
  /** A replacement string with `$&`, `$1`, `$<name>`, `` $` ``, `$'` or `$$` in it. */
  template: string;
  match: Match;
  /** The whole text, for `` $` `` and `$'`. */
  content: string;
};
