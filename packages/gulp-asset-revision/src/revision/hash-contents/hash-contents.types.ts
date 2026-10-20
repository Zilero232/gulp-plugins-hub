export type HashContentsInput = {
  contents: Buffer;
  /** Characters of the hex digest to keep. */
  length: number;
};
