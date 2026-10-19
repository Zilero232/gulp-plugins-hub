export type ToSassErrorInput = {
  error: unknown;
  /** The file being compiled, named when the error does not point at a stylesheet of its own. */
  filePath: string;
};
