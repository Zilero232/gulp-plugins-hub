import { isString } from 'remeda';

import type { ResolveFileTextInput } from './file-text.types';

/** The text of a `header` or `footer` option for one file: as given, what its function returns, or nothing. */
export const resolveFileText = async ({ name, text, file }: ResolveFileTextInput): Promise<string> => {
  if (text === undefined || isString(text)) {
    return text ?? '';
  }

  const result: unknown = await text({ file });

  if (!isString(result)) {
    throw new TypeError(`${name} must return the text as a string, got ${result === null ? 'null' : typeof result}`);
  }

  return result;
};
