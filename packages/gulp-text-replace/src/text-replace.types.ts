import type { Vinyl } from '@zilero/gulp-plugin-factory';

export type ReplacerInput = {
  /** The matched text. */
  match: string;
  /** Capture groups of a regular expression, in order; empty for a string search. */
  groups: (string | undefined)[];
  /** Named capture groups. */
  namedGroups: Record<string, string | undefined>;
  /** Where the match starts in the contents. */
  offset: number;
  file: Vinyl;
};

/** Returns the replacement for one match. */
export type Replacer = (input: ReplacerInput) => string | Promise<string>;

/** Text added at the start or the end of every file, or a function of the file that returns it. */
export type FileText = ((input: { file: Vinyl }) => string | Promise<string>) | string;

export type ResolveFileTextInput = {
  text: FileText | undefined;
  file: Vinyl;
};
