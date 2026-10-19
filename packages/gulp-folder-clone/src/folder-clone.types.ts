import type { Vinyl } from '@zilero/gulp-plugin-factory';

export type CloneInput = {
  /** The copy, already moved into `dir`; change it in place or return another file. */
  file: Vinyl;
  /** The folder this copy goes to, as given in `dirs`. */
  dir: string;
  /** The file the copy was made from. */
  original: Vinyl;
};

/** Runs for every copy: return nothing to keep it, `null` to skip it, or a file to emit instead. */
export type CloneHook = (
  input: CloneInput
) => Promise<Vinyl | null | undefined | void> | Vinyl | null | undefined | void;
