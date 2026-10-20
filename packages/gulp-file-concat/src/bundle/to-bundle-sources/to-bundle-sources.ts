import type { BundleSource } from '../bundle.types';
import type { ToBundleSourcesInput } from './to-bundle-sources.types';

import { getSourceName } from '../get-source-name';

const BOM = '﻿';

/**
 * Names each input after its path relative to the base and strips its byte order mark: one in the middle of the
 * bundle would be a stray character. Two inputs with the same path and different text (one file transformed
 * twice) get `?2`, `?3` after the second name, since a source map cannot hold two texts under one name; the same
 * text keeps one name.
 */
export const toBundleSources = ({ files, base }: ToBundleSourcesInput): BundleSource[] => {
  const contentsByName = new Map<string, string[]>();

  return files.map((file) => {
    const text = file.contents.toString();
    const content = text.startsWith(BOM) ? text.slice(BOM.length) : text;
    const sourceName = getSourceName({ base, filePath: file.path });
    const variants = contentsByName.get(sourceName) ?? [];
    const known = variants.indexOf(content);
    const index = known === -1 ? variants.push(content) - 1 : known;

    contentsByName.set(sourceName, variants);

    return { file, name: index === 0 ? sourceName : `${sourceName}?${index + 1}`, content };
  });
};
