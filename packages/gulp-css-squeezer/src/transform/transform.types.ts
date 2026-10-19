import type { CustomAtRules, TransformOptions } from 'lightningcss';

export type TransformCssInput = {
  options: TransformOptions<CustomAtRules>;
  /** The file being processed, named in errors. */
  filePath: string;
};
