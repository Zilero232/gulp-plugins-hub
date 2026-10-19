import { spawnSync } from 'node:child_process';

import type { RunCommandInput } from './publish.types';

/** Runs a command with its output going straight to the log; a failure stops the release. */
export const runCommand = ({ command, args, cwd }: RunCommandInput): void => {
  const { status, error } = spawnSync(command, args, { cwd, stdio: 'inherit' });

  if (error) {
    throw error;
  }

  if (status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with code ${status}`);
  }
};
