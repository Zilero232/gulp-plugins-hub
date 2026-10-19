import type Vinyl from 'vinyl';

export type ContentHookInput = {
  /** The text of the file at this step. */
  content: string;
  file: Vinyl;
};

/** A hook on the text of a file: gets it and returns the text to continue with. */
export type ContentHook = (input: ContentHookInput) => string | Promise<string>;
