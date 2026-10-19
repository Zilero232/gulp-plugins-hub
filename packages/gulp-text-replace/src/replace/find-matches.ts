import type { FindMatchesInput, Match } from './replace.types';

const fromRegExpMatch = (match: RegExpExecArray): Match => {
  const [text, ...groups] = match;
  // No prototype, so `$<toString>` is a missing group as in String.prototype.replace, not a method.
  const namedGroups: Record<string, string | undefined> = Object.assign(Object.create(null), match.groups);

  return {
    text,
    groups,
    namedGroups,
    hasNamedGroups: match.groups !== undefined,
    index: match.index
  };
};

const findLiteral = ({ content, search }: { content: string; search: string }): Match[] => {
  const matches: Match[] = [];

  for (let index = content.indexOf(search); index !== -1; index = content.indexOf(search, index + search.length)) {
    matches.push({ text: search, groups: [], namedGroups: {}, hasNamedGroups: false, index });
  }

  return matches;
};

/**
 * Every match of a string (literal, every occurrence) or a RegExp (JavaScript semantics: every match with `g`,
 * the first otherwise). A copy of the RegExp is used, so its `lastIndex` never carries over from another file.
 */
export const findMatches = ({ content, search }: FindMatchesInput): Match[] => {
  if (typeof search === 'string') {
    return findLiteral({ content, search });
  }

  const regexp = new RegExp(search.source, search.flags);

  if (regexp.global) {
    return [...content.matchAll(regexp)].map(fromRegExpMatch);
  }

  const match = regexp.exec(content);

  return match ? [fromRegExpMatch(match)] : [];
};
