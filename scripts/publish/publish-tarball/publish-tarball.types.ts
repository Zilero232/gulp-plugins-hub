export type PublishTarballInput = {
  tarball: string;
  /** `npm publish --dry-run`: everything but the upload. */
  dryRun: boolean;
  /** From a maintainer's machine: no provenance, which needs the OIDC token of CI. */
  local: boolean;
};
