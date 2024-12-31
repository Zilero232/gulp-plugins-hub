import type { Transform as TransformStream } from 'node:stream';

// Options for configuring the gulp conditional plugin.
export interface GulpConditionalOptions {
	condition: Condition; // Condition to determine which child stream to use
	onConditionMet: TransformStream; // Stream to process if condition is met
	onConditionNotMet?: TransformStream; // Optional stream to process if condition is not met
}

// Type provides flexibility for defining conditions for file transformations.
export type Condition = boolean | ConditionOptions;

// Object with various condition options for file validation.
export interface ConditionOptions {
	extensions?: string[]; // Array of file extensions to match
	namesContains?: string[]; // Array of substrings that must be present in file names
	namesEquals?: string[]; // Array of exact file names to match
	minSize?: number; // Minimum file size in bytes
	maxSize?: number; // Maximum file size in bytes
	modifiedAfter?: Date | string; // Files modified after this date
	modifiedBefore?: Date | string; // Files modified before this date
	createdAfter?: Date | string; // Files created after this date
	createdBefore?: Date | string; // Files created before this date
	containsContent?: string; // Content that must be present in the file
	pathContains?: string; // String that must be present in the file path
	lineCount?: number; // Number of lines the file must contain
	sizeInKB?: number; // Size of the file in kilobytes
	customFileFilter?: (file: FileVinyl) => boolean; // Custom function for additional file checks
}
