import path from 'node:path';

import type { RevisePathInput } from './revision.types';

/** `css/main.css` + hash → `css/main-3f2a9c1b7d.css`. */
export const revisePath = ({ relative, hash }: RevisePathInput): string => {
  const { dir, name, ext } = path.posix.parse(relative);

  return path.posix.join(dir, `${name}-${hash}${ext}`);
};
