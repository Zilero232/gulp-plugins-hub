import type { FileHookInput } from '@zilero/gulp-plugin-factory';

export type ReplacerInput = FileHookInput & {
  /** The matched text. */
  match: string;
  /** Capture groups of a regular expression, in order; empty for a string search. */
  groups: (string | undefined)[];
  /** Named capture groups. */
  namedGroups: Record<string, string | undefined>;
  /** Where the match starts in the contents. */
  offset: number;
};

/**
 * Returns the replacement for one match, or a promise of it. Other values than strings are converted with
 * `String()`, as `String.prototype.replace` does; `undefined` (a forgotten `return`) is an error.
 */
export type Replacer = (input: ReplacerInput) => string | Promise<string>;

/** Text added at the start or the end of every file, or a function of the file that returns it. */
export type FileText = ((input: FileHookInput) => string | Promise<string>) | string;
