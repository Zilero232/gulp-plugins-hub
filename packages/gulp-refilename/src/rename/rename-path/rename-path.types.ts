import type { Vinyl } from '@zilero/gulp-plugin-factory';

import type { RenameObject } from '../../refilename.schema';
import type { PathParts, RenameFunction } from '../../refilename.types';

export type RenamePathInput = {
  parts: PathParts;
  rename: string | RenameFunction | RenameObject;
  file: Vinyl;
};

export type RunRenameFunctionInput = {
  parts: PathParts;
  rename: RenameFunction;
  file: Vinyl;
};

export type ApplyChangesInput = {
  parts: PathParts;
  changes: RenameObject;
};
