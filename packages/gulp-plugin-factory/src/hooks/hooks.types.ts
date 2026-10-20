import type Vinyl from 'vinyl';

/** What a hook on a file receives. */
export type FileHookInput = {
  file: Vinyl;
};

export type ContentHookInput = FileHookInput & {
  /** The text of the file at this step. */
  content: string;
};

/** A hook on the text of a file: gets it and returns the text to continue with. */
export type ContentHook = (input: ContentHookInput) => string | Promise<string>;

export type RunContentHookInput = ContentHookInput & {
  /** The option name, for the error when the hook returns something other than a string. */
  name: string;
  hook?: ContentHook;
};
