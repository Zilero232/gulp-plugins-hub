import path from 'node:path';

import type { PackWorkspaceInput } from './publish.types';

import { runCommand } from './run-command';

/** Packs the workspace with its `workspace:` and `catalog:` versions resolved; returns the tarball's path. */
export const packWorkspace = ({ workspace, destination }: PackWorkspaceInput): string => {
  const { name, version } = workspace.manifest;
  const tarball = path.join(destination, `${name.replace('@', '').replace('/', '-')}-${version}.tgz`);

  runCommand({ command: 'bun', args: ['pm', 'pack', '--filename', tarball, '--quiet'], cwd: workspace.directory });

  return tarball;
};
