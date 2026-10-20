import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import path from 'node:path';

import type { TargetsResolver } from '../targets.types';

/**
 * Targets from a browserslist query, resolved once, so an invalid query fails when the plugin is created.
 * Without a query, from the browserslist config nearest to each file, resolved once per folder.
 */
export const createTargetsResolver = (query: string | string[] | undefined): TargetsResolver => {
  if (query !== undefined) {
    const targets = browserslistToTargets(browserslist(query));

    return () => targets;
  }

  const byFolder = new Map<string, ReturnType<TargetsResolver>>();

  return (filePath) => {
    const folder = path.dirname(filePath);
    const known = byFolder.get(folder);

    if (known) {
      return known;
    }

    const targets = browserslistToTargets(browserslist(undefined, { path: filePath }));

    byFolder.set(folder, targets);

    return targets;
  };
};
