import type { FileHookInput } from '@zilero/gulp-plugin-factory';

/** A warning from Lightning CSS, such as a rule `errorRecovery` dropped. */
export type CssWarningInput = FileHookInput & {
  /** The warning text. */
  message: string;
  /** Lightning CSS's warning kind, such as `'UnexpectedToken'`. */
  type: string;
  /** The line in the file, from 1. */
  line: number;
  /** The column in the line, from 1. */
  column: number;
};

/** Receives each warning Lightning CSS reports for a file. */
export type CssWarningHook = (input: CssWarningInput) => Promise<void> | void;
