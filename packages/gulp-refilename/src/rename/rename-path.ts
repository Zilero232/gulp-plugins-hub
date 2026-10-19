import path from 'node:path';
import { isDefined, pickBy } from 'remeda';

import type { PathParts } from '../refilename.types';
import type { RenamePathInput } from './rename.types';

import { renameResultSchema } from '../refilename.schema';

const normalizeExtname = (extname: string): string =>
  extname === '' || extname.startsWith('.') ? extname : `.${extname}`;

/** The new parts for a file name, an object of changes or a function. */
export const renamePath = async ({ parts, rename, file }: RenamePathInput): Promise<PathParts> => {
  if (typeof rename === 'string') {
    const { name, ext } = path.parse(rename);

    return { ...parts, stem: name, extname: ext };
  }

  if (typeof rename === 'function') {
    const result = renameResultSchema.safeParse(pickBy(await rename({ parts: { ...parts }, file }), isDefined));

    if (!result.success) {
      throw new Error(
        `The rename function returned invalid parts: ${result.error.issues.map((issue) => issue.message).join('; ')}`
      );
    }

    const changed = { ...parts, ...pickBy(result.data, isDefined) };

    return { ...changed, extname: normalizeExtname(changed.extname) };
  }

  return {
    dirname: rename.dirname ?? parts.dirname,
    stem: `${rename.prefix ?? ''}${rename.stem ?? parts.stem}${rename.suffix ?? ''}`,
    extname: rename.extname === undefined ? parts.extname : normalizeExtname(rename.extname)
  };
};
