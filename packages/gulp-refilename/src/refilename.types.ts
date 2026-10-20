import type { FileHookInput } from '@zilero/gulp-plugin-factory';

import type { RenameObject } from './refilename.schema';

/** A file path split the way the rename works on it: `dirname/stem + extname`, relative to `file.base`. */
export type PathParts = {
  /** Directory relative to `file.base`; `.` for the base itself. */
  dirname: string;
  /** File name without the last extension: `app.min` for `app.min.js`. */
  stem: string;
  /** Last extension with its dot: `.js`; empty when there is none. */
  extname: string;
};

export type RenameInput = FileHookInput & {
  /** A copy of the current parts: change it in place and return nothing, or return the changes. */
  parts: PathParts;
};

/**
 * Gets the current parts and either returns the changes (the keys of the object option; what it leaves out or
 * sets to undefined stays) or changes `parts` in place and returns nothing. May be async.
 */
export type RenameFunction = (
  input: RenameInput
) => Promise<RenameObject | undefined | void> | RenameObject | undefined | void;
