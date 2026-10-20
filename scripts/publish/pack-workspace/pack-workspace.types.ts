import type { Workspace } from '../publish.types';

export type PackWorkspaceInput = {
  workspace: Workspace;
  /** The folder the tarball is written to. */
  destination: string;
};
