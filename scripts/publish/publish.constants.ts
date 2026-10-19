import path from 'node:path';

/** Where the published workspaces live; private ones are skipped. */
export const PACKAGES_DIR = 'packages';

/** Where the tarballs are packed, emptied on every run. */
export const PACK_DIR = path.resolve('.pack');
