import type { ArchiveFormat } from '../../archive-creator.types';

import { EXTENSION_FORMATS } from '../../archive-creator.constants';

/** The format an archive name's extension stands for (`.zip`, `.tar`, `.tgz`, `.tar.gz`, any case), if any. */
export const getExtensionFormat = (name: string): ArchiveFormat | undefined => {
  const lowerName = name.toLowerCase();

  return EXTENSION_FORMATS.find(([extension]) => lowerName.endsWith(extension))?.[1];
};
