import type { Vinyl } from '@zilero/gulp-plugin-factory';

/** Text for the start or end of the result, or a function of the concatenated files that returns it. */
export type BundleText = ((input: { files: Vinyl[] }) => string | Promise<string>) | string;
