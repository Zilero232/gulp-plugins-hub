import type { GulpFileExcludeOptions } from '../types';

interface IsFileExcluded {
  filePath: string;
  patterns: GulpFileExcludeOptions['patterns'];
}

/**
 * Checks if a file should be excluded based on patterns.
 * Supports both string and RegExp patterns.
 *
 * @param filePath - Path to the file to check
 * @param patterns - Array of string or RegExp patterns
 * @returns boolean indicating if file should be excluded
 */
export const isFileExcluded = ({ filePath, patterns = [] }: IsFileExcluded): boolean => {
  if (!filePath || !Array.isArray(patterns)) {
    return false;
  }

  return patterns.some((pattern) => {
    // Check string patterns
    if (typeof pattern === 'string') {
      return filePath.includes(pattern);
    }

    // Check RegExp patterns
    if (pattern instanceof RegExp) {
      return pattern.test(filePath);
    }

    return false;
  });
};
