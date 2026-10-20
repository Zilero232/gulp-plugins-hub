export type CreatePathMatcherInput = {
  /** Globs (picomatch, dotfiles included) and regular expressions; an empty list matches nothing. */
  patterns: readonly (string | RegExp)[];
  /** Globs ignore case (`*.PNG` matches `a.png`); regular expressions keep their own flags. Default false. */
  ignoreCase?: boolean;
};
