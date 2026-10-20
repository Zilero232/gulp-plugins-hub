import type { FileHookInput, Vinyl } from '@zilero/gulp-plugin-factory';
import type { Stats } from 'node:fs';

import type { COMPARE_MODES } from './file-changed.constants';

/** The folder the build writes to, or a function of the file that returns it; relative to `file.cwd`. */
export type DestResolver = ((input: FileHookInput) => string) | string;

/** Returns the path of the built file relative to the destination, for builds that rename files. */
export type TargetResolver = (input: FileHookInput) => string;

export type CompareMode = (typeof COMPARE_MODES)[number];

export type CompareInput = {
  file: Vinyl;
  /** The built file in the destination. */
  target: { path: string; stat: Stats };
};

/** Returns true when the file changed and has to be built again. */
export type CompareFunction = (input: CompareInput) => boolean | Promise<boolean>;
