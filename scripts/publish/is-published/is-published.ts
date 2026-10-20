import { execFileSync } from 'node:child_process';

import type { IsPublishedInput } from './is-published.types';

/**
 * Whether the package is on npm: this exact version, or any version when `version` is left out. A missing package
 * or version is E404; anything else stops the release.
 */
export const isPublished = ({ name, version }: IsPublishedInput): boolean => {
  try {
    execFileSync('npm', ['view', version ? `${name}@${version}` : name, 'version'], { stdio: 'pipe' });

    return true;
  } catch (error) {
    if (error instanceof Error && 'stderr' in error && String(error.stderr).includes('E404')) {
      return false;
    }

    throw error;
  }
};
