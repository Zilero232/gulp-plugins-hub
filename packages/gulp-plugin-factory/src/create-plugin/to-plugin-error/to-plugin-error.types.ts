import type Vinyl from 'vinyl';

export type ToPluginErrorInput = {
  name: string;
  error: unknown;
  /** The file being processed, for `fileName` in the error. */
  file?: Vinyl;
};
