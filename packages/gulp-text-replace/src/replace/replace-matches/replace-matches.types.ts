import type { Vinyl } from '@zilero/gulp-plugin-factory';
import type MagicString from 'magic-string';

import type { Replacer } from '../../text-replace.types';
import type { Match } from '../replace.types';

export type ReplaceMatchesInput = {
  magic: MagicString;
  content: string;
  rule: { search: string | RegExp; replace: string | Replacer };
  file: Vinyl;
};

export type GetReplacementInput = Omit<ReplaceMatchesInput, 'magic'> & {
  match: Match;
};
