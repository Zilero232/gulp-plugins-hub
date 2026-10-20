import type { FileHookInput } from '@zilero/gulp-plugin-factory';
import type { Duplex } from 'node:stream';

/** A glob (`'*.js'`, `'scripts/**\/*.js'`) or a regular expression, matched against `file.relative`. */
export type PathPattern = string | RegExp;

/** A condition written as a function of the file; may be async. */
export type ConditionFunction = (input: FileHookInput) => boolean | Promise<boolean>;

/**
 * Sends a file to a branch when it holds:
 * - a boolean: for every file or none;
 * - a glob, a RegExp or an array of them: when one matches `file.relative`;
 * - a function of the file, sync or async: when it returns true.
 */
export type Condition = boolean | ConditionFunction | PathPattern | PathPattern[];

/** What a branch sends its files through: a plugin stream. */
export type BranchStream = Duplex;

/**
 * Creates the branch: one plugin, or several in an array, which the files go through in order. Called once,
 * for the first file that goes to the branch.
 */
export type BranchHandler = () => BranchStream | BranchStream[];
