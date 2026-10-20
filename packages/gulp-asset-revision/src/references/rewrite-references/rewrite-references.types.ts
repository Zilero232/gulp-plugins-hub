import type { RevisionManifest } from '../../asset-revision.types';
import type { FindReferencesInput } from '../references.types';

export type RewriteReferencesInput = FindReferencesInput & {
  revisions: RevisionManifest;
};
