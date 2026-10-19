import type { PublishTarballInput } from './publish.types';

import { runCommand } from './run-command';

/**
 * `npm publish` of a tarball: trusted publishing in CI, provenance from `publishConfig`. Locally the login of the
 * maintainer is used, and provenance is turned off with a flag, which npm puts before `publishConfig`.
 */
export const publishTarball = ({ tarball, dryRun, local }: PublishTarballInput): void => {
  const flags = [...(dryRun ? ['--dry-run'] : []), ...(local ? ['--provenance=false'] : [])];

  runCommand({ command: 'npm', args: ['publish', tarball, '--access', 'public', ...flags] });
};
