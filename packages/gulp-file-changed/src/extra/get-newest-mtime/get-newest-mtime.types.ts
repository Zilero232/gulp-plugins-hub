export type GetNewestMtimeInput = {
  /** Globs, relative to `cwd`. */
  patterns: string[];
  cwd: string;
};
