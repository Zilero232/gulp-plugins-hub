import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Manifest, Workspace } from './publish.types';

import { PACKAGES_DIR } from './publish.constants';

/** The workspaces under packages/ that are published (not private). */
export const readWorkspaces = async (): Promise<Workspace[]> => {
  const entries = await readdir(PACKAGES_DIR, { withFileTypes: true });
  // Sorted, so the publish order does not depend on the file system.
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(PACKAGES_DIR, entry.name))
    .sort();

  const workspaces = await Promise.all(
    directories.map(async (directory): Promise<Workspace> => {
      const manifest: Manifest = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));

      return { directory, manifest };
    })
  );

  return workspaces.filter(({ manifest }) => !manifest.private);
};
