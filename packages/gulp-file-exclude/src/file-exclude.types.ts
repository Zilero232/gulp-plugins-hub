import type { FileHookInput } from '@zilero/gulp-plugin-factory';

/** Returns true to drop the file. */
export type ExcludePredicate = (input: FileHookInput) => boolean | Promise<boolean>;
