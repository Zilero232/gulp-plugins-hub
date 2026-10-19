import type { ExpandReplacementInput } from './replace.types';

/** `$$`, `$&`, `` $` ``, `$'`, `$n`, `$nn` and `$<name>`: the patterns `String.prototype.replace` understands. */
const PATTERN = /\$([$&`']|\d{1,2}|<([^>]*)>)/g;

/**
 * The replacement string for one match, with its `$` patterns filled in exactly as `String.prototype.replace`
 * does (GetSubstitution in the ECMAScript spec): `$10` is group 10 when there is one, else group 1 and a `0`;
 * `$<name>` is empty for a missing group of a RegExp with named groups, and stays as written without any.
 */
export const expandReplacement = ({ template, match, content }: ExpandReplacementInput): string =>
  template.replace(PATTERN, (pattern, token: string, name: string | undefined) => {
    const group = (index: number): string => match.groups[index - 1] ?? '';
    const count = match.groups.length;

    if (token === '$') {
      return '$';
    }

    if (token === '&') {
      return match.text;
    }

    if (token === '`') {
      return content.slice(0, match.index);
    }

    if (token === "'") {
      return content.slice(match.index + match.text.length);
    }

    if (name !== undefined) {
      return match.hasNamedGroups ? (match.namedGroups[name] ?? '') : pattern;
    }

    const twoDigits = Number(token);

    if (token.length === 2 && twoDigits >= 1 && twoDigits <= count) {
      return group(twoDigits);
    }

    const oneDigit = Number(token[0]);

    if (oneDigit >= 1 && oneDigit <= count) {
      return group(oneDigit) + token.slice(1);
    }

    return pattern;
  });
