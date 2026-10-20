import type { FileHookInput, Vinyl } from '@zilero/gulp-plugin-factory';

export type CloneInput = FileHookInput & {
  /** The folder this copy goes to, as given in `dirs`. */
  dir: string;
  /** The file the copy was made from. */
  original: Vinyl;
};

/**
 * Runs for every copy (`file`, already moved into `dir`): change it in place and return nothing to keep it,
 * return `null` to skip it, or a file to emit instead.
 */
export type CloneHook = (
  input: CloneInput
) => Promise<Vinyl | null | undefined | void> | Vinyl | null | undefined | void;
