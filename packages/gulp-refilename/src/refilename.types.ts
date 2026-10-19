import type { Vinyl } from '@zilero/gulp-plugin-factory';

/** A file path split the way the rename works on it: `dirname/stem + extname`, relative to `file.base`. */
export type PathParts = {
  /** Directory relative to `file.base`; `.` for the base itself. */
  dirname: string;
  /** File name without the last extension: `app.min` for `app.min.js`. */
  stem: string;
  /** Last extension with its dot: `.js`; empty when there is none. */
  extname: string;
};

export type RenameInput = {
  parts: PathParts;
  file: Vinyl;
};

/** Gets the current parts and returns the ones to change; what it leaves out (or sets to undefined) stays. */
export type RenameFunction = (input: RenameInput) => Partial<PathParts> | Promise<Partial<PathParts>>;
