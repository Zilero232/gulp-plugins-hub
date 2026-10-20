import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

import { paths } from '../config.ts';
import { isBuiltFrom } from './is-built-from.ts';

/**
 * Removes what the assets task built from a deleted source in src/: every format and width, in its folder and in
 * email/. A source that shares the stem (`logo.png` next to `logo.svg`) loses its files too: the assets run the
 * deletion starts writes them again, since file-changed finds them missing.
 */
export const removeBuilt = async (source: string): Promise<void> => {
  const { dir, name } = path.parse(path.relative(paths.src, source));
  const folders = [path.join(paths.dist, dir), path.join(paths.dist, 'email', dir)];

  await Promise.all(
    folders.map(async (folder) => {
      const entries = await readdir(folder).catch((): string[] => []);
      const built = entries.filter((entry) => isBuiltFrom({ entry, stem: name }));

      await Promise.all(built.map((entry) => rm(path.join(folder, entry), { force: true })));
    })
  );
};
