import type { GulpFileExcludeOptions } from '../types';

interface CheckFileSize {
  file: FileVinyl;
  size?: Required<GulpFileExcludeOptions>['size'];
}

/**
 * Check if a file is excluded based on its size.
 */
export const checkFileSize = ({ file, size }: CheckFileSize): boolean => {
  const [min, max] = size || [];

  // Get file size in bytes from Buffer
  const fileSize = file.contents instanceof Buffer ? file.contents.length : file.stat?.size || 0;

  if ((min && fileSize < min) || (max && fileSize > max)) {
    return true;
  }

  return false;
};
