export type Manifest = {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

export type Workspace = {
  directory: string;
  manifest: Manifest;
};

export type IsPublishedInput = {
  name: string;
  /** Left out: whether any version of the package is on npm. */
  version?: string;
};

export type RunCommandInput = {
  command: string;
  args: string[];
  cwd?: string;
};

export type PackWorkspaceInput = {
  workspace: Workspace;
  /** The folder the tarball is written to. */
  destination: string;
};

export type PublishTarballInput = {
  tarball: string;
  /** `npm publish --dry-run`: everything but the upload. */
  dryRun: boolean;
  /** From a maintainer's machine: no provenance, which needs the OIDC token of CI. */
  local: boolean;
};
