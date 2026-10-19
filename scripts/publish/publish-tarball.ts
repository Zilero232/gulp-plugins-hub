import type { PublishTarballInput } from './publish.types';

import { runCommand } from './run-command';

/** `npm publish` of a tarball: trusted publishing in CI, provenance from `publishConfig`. */
export const publishTarball = ({ tarball, dryRun }: PublishTarballInput): void => {
  runCommand({ command: 'npm', args: ['publish', tarball, '--access', 'public', ...(dryRun ? ['--dry-run'] : [])] });
};
