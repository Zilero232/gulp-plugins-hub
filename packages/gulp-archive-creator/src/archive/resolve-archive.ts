import type { ResolveArchiveInput, ResolvedArchive } from './archive.types';

import { FORMAT_EXTENSIONS } from '../archive-creator.constants';
import { getExtensionFormat } from './get-extension-format';

/**
 * The format and the final file name: an explicit format wins, else the extension decides, else zip. The schema
 * rejects an explicit format that differs from the extension's.
 */
export const resolveArchive = ({ name, format }: ResolveArchiveInput): ResolvedArchive => {
  const fromExtension = getExtensionFormat(name);
  const resolvedFormat = format ?? fromExtension ?? 'zip';

  return {
    format: resolvedFormat,
    fileName: fromExtension ? name : `${name}${FORMAT_EXTENSIONS[resolvedFormat]}`
  };
};
