import type { ResolveArchiveInput, ResolvedArchive } from './archive.types';

import { EXTENSION_FORMATS, FORMAT_EXTENSIONS } from '../archive-creator.constants';

/** The format and the final file name: an explicit format wins, else the extension decides, else zip. */
export const resolveArchive = ({ name, format }: ResolveArchiveInput): ResolvedArchive => {
  const lowerName = name.toLowerCase();
  const fromExtension = EXTENSION_FORMATS.find(([extension]) => lowerName.endsWith(extension))?.[1];
  const resolvedFormat = format ?? fromExtension ?? 'zip';

  return {
    format: resolvedFormat,
    fileName: fromExtension ? name : `${name}${FORMAT_EXTENSIONS[resolvedFormat]}`
  };
};
