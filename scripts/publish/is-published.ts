import { execFileSync } from 'node:child_process';

import type { Manifest } from './publish.types';

/** Whether this exact version is on npm. A missing package or version is E404; anything else stops the release. */
export const isPublished = ({ name, version }: Manifest): boolean => {
  try {
    execFileSync('npm', ['view', `${name}@${version}`, 'version'], { stdio: 'pipe' });

    return true;
  } catch (error) {
    if (error instanceof Error && 'stderr' in error && String(error.stderr).includes('E404')) {
      return false;
    }

    throw error;
  }
};
