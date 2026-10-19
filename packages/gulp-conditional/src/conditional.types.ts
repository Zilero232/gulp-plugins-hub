import type { Vinyl } from '@zilero/gulp-plugin-factory';
import type { Duplex } from 'node:stream';

/** A file goes to a branch when its condition is true, or returns true for the file. */
export type Condition = ((input: { file: Vinyl }) => boolean | Promise<boolean>) | boolean;

/** What a branch sends its files through: a plugin stream. */
export type BranchStream = Duplex;

/**
 * Creates the branch: one plugin, or several in an array, which the files go through in order. Called once,
 * for the first file that goes to the branch.
 */
export type BranchHandler = () => BranchStream | BranchStream[];
