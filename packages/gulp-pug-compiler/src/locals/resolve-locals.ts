import { isFunction, isPlainObject } from 'remeda';

import type { TemplateData } from '../pug-compiler.types';
import type { ResolveLocalsInput } from './locals.types';

/**
 * The locals for a file: `file.data` (set by gulp-data, front-matter plugins, …) with the `data` option over it.
 */
export const resolveLocals = async ({ file, data }: ResolveLocalsInput): Promise<TemplateData> => {
  const fileData = 'data' in file && isPlainObject(file.data) ? file.data : {};
  const optionData = isFunction(data) ? await data({ file }) : data;

  return { ...fileData, ...optionData };
};
