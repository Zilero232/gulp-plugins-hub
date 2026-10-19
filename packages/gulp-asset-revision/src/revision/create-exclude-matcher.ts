import path from 'node:path';
import picomatch from 'picomatch';
import { partition } from 'remeda';

const matchNothing = (): boolean => false;

/** Globs without a slash match the file name in any directory, the others the whole relative path; case is ignored. */
export const createExcludeMatcher = (globs: string[]): ((relative: string) => boolean) => {
  const [pathGlobs, nameGlobs] = partition(globs, (glob) => glob.includes('/'));
  const options = { dot: true, nocase: true };
  const matchName = nameGlobs.length ? picomatch(nameGlobs, options) : matchNothing;
  const matchPath = pathGlobs.length ? picomatch(pathGlobs, options) : matchNothing;

  return (relative) => matchName(path.posix.basename(relative)) || matchPath(relative);
};
