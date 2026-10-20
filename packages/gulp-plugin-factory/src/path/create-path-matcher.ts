import path from 'node:path';
import picomatch from 'picomatch';
import { partition } from 'remeda';

import type { CreatePathMatcherInput } from './path.types';

import { toPosixPath } from './to-posix-path';

const matchNothing = (): boolean => false;

/**
 * One matcher for every pattern: globs through picomatch, regular expressions as they are. A glob without a
 * slash matches the file name in any directory (picomatch's own `basename` option breaks globs with a slash).
 */
export const createPathMatcher = ({
  patterns,
  ignoreCase = false
}: CreatePathMatcherInput): ((relativePath: string) => boolean) => {
  const [regexps, globs] = partition(patterns, (pattern) => pattern instanceof RegExp);
  const [pathGlobs, nameGlobs] = partition(globs, (glob) => glob.includes('/'));
  const options = { dot: true, nocase: ignoreCase };
  const matchName = nameGlobs.length ? picomatch(nameGlobs, options) : matchNothing;
  const matchPath = pathGlobs.length ? picomatch(pathGlobs, options) : matchNothing;

  return (relativePath) => {
    const posixPath = toPosixPath(relativePath);

    return (
      matchName(path.posix.basename(posixPath)) ||
      matchPath(posixPath) ||
      regexps.some((regexp) => {
        // A global or sticky RegExp keeps its position between calls; every file starts from the beginning.
        regexp.lastIndex = 0;

        return regexp.test(posixPath);
      })
    );
  };
};
