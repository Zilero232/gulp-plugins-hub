import { createHash } from 'node:crypto';

import type { HashContentsInput } from './hash-contents.types';

/** The first characters of the SHA-256 of the contents. */
export const hashContents = ({ contents, length }: HashContentsInput): string =>
  createHash('sha256').update(contents).digest('hex').slice(0, length);
