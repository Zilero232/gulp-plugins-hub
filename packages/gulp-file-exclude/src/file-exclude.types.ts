import type { Vinyl } from '@zilero/gulp-plugin-factory';

/** Returns true to drop the file. */
export type ExcludePredicate = (input: { file: Vinyl }) => boolean | Promise<boolean>;

export type SizeRange = {
  min?: number;
  max?: number;
};
