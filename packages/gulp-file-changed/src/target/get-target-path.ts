import path from 'node:path';

import type { GetTargetPathInput } from './target.types';

/** Where `dest` writes the file: `target`'s path (relative to the destination, or absolute), or its own path. */
export const getTargetPath = ({ file, destination, extname, target }: GetTargetPathInput): string => {
  if (target) {
    return path.resolve(destination, target({ file }));
  }

  if (extname) {
    return path.join(destination, path.dirname(file.relative), `${file.stem}${extname}`);
  }

  return path.join(destination, file.relative);
};
