import type { BufferFile } from '@zilero/gulp-plugin-factory';

import { toPosixPath } from '@zilero/gulp-plugin-factory';
import picomatch from 'picomatch';
import { sortBy } from 'remeda';

import type { SortByGlobsInput } from './order.types';

/** A stable sort by the first glob each file matches; files no glob matches keep their order, after the rest. */
export const sortByGlobs = ({ files, order }: SortByGlobsInput): BufferFile[] => {
  const matchers = order.map((glob) => picomatch(glob, { dot: true }));

  const rank = (file: BufferFile): number => {
    const index = matchers.findIndex((matches) => matches(toPosixPath(file.relative)));

    return index === -1 ? matchers.length : index;
  };

  return sortBy(files, rank);
};
