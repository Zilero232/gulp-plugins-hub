import path from 'node:path';
import { difference, isDefined, isPlainObject, isString, pickBy } from 'remeda';

import type { RenameObject } from '../../refilename.schema';
import type { PathParts, RenameInput } from '../../refilename.types';
import type { ApplyChangesInput, RenamePathInput, RunRenameFunctionInput } from './rename-path.types';

import { KEY_HINTS } from '../../refilename.constants';
import { renameObjectSchema } from '../../refilename.schema';

const INPUT_KEYS = ['parts', 'file'];

const normalizeExtname = (extname: string): string =>
  extname === '' || extname.startsWith('.') ? extname : `.${extname}`;

const applyChanges = ({ parts, changes }: ApplyChangesInput): PathParts => ({
  dirname: changes.dirname ?? parts.dirname,
  stem: `${changes.prefix ?? ''}${changes.stem ?? parts.stem}${changes.suffix ?? ''}`,
  extname: changes.extname === undefined ? parts.extname : normalizeExtname(changes.extname)
});

/**
 * Runs the function and checks its changes like the object option. Returning nothing means the function changed
 * `parts` in place, the way gulp-rename callbacks do.
 */
const runRenameFunction = async ({ parts, rename, file }: RunRenameFunctionInput): Promise<RenameObject> => {
  const input: RenameInput = { parts: { ...parts }, file };
  const returned: unknown = await rename(input);

  // `(path) => { path.stem += '.min' }` written for gulp-rename sets keys on the input, not on its parts.
  const [misplaced] = difference(Object.keys(input), INPUT_KEYS);

  if (returned === undefined && misplaced !== undefined) {
    const key = Object.hasOwn(KEY_HINTS, misplaced) ? KEY_HINTS[misplaced] : misplaced;

    throw new Error(
      `The rename function gets { parts, file }: change parts.${key} instead of ${misplaced}, or return the changes`
    );
  }

  const changes = returned === undefined ? input.parts : returned;
  const result = renameObjectSchema.safeParse(isPlainObject(changes) ? pickBy(changes, isDefined) : changes);

  if (!result.success) {
    throw new Error(
      `The rename function returned invalid parts: ${result.error.issues.map((issue) => issue.message).join('; ')}`
    );
  }

  return result.data;
};

/** The new parts for a file name, an object of changes or a function. */
export const renamePath = async ({ parts, rename, file }: RenamePathInput): Promise<PathParts> => {
  if (isString(rename)) {
    const { name, ext } = path.parse(rename);

    return { ...parts, stem: name, extname: ext };
  }

  const changes = typeof rename === 'function' ? await runRenameFunction({ parts, rename, file }) : rename;

  return applyChanges({ parts, changes });
};
