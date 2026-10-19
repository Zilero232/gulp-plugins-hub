import { rm } from 'node:fs/promises';

import { paths } from '../config.ts';

export const clean = async (): Promise<void> => {
  await rm(paths.dist, { recursive: true, force: true });
  await rm(paths.release, { recursive: true, force: true });
};

clean.description = 'Remove dist/ and release/';
