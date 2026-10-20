export type WhenInput = {
  condition: boolean;
  /** Creates the step; called only when the condition holds. */
  then: () => NodeJS.ReadWriteStream;
};

export type BuiltFromInput = {
  /** A file name in a dist/ folder. */
  entry: string;
  /** The source file's name without its extension. */
  stem: string;
};
