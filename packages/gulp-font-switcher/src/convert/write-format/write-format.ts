import { createFont } from 'fonteditor-core';
import { match } from 'ts-pattern';

import type { WriteFormatInput } from './write-format.types';

import { fontverter } from '../../vendor';
import { isCff } from '../is-cff';

/** fonteditor-core for what fontverter cannot write: legacy formats and CFF outlines turned into TrueType. */
const rebuild = ({ sfnt, format, hinting }: WriteFormatInput): Buffer => {
  const font = createFont(sfnt, { type: isCff(sfnt) ? 'otf' : 'ttf', hinting });

  return Buffer.from(font.write({ type: format, hinting, toBuffer: true }));
};

/**
 * The font in one format. woff2, woff and ttf from a TrueType font are the same font in another container, every
 * table kept. ttf from CFF outlines, EOT and SVG fonts are rebuilt by fonteditor-core, without the OpenType
 * layout tables (ligatures, kerning).
 */
export const writeFormat = async ({ sfnt, format, hinting }: WriteFormatInput): Promise<Buffer> => {
  const contents = await match(format)
    .with('woff2', 'woff', (container) => fontverter.convert(sfnt, container))
    .with('ttf', () => (isCff(sfnt) ? rebuild({ sfnt, format, hinting }) : sfnt))
    .with('eot', 'svg', () => rebuild({ sfnt, format, hinting }))
    .exhaustive();

  if (!contents.length) {
    throw new Error(`The ${format} encoder produced an empty file`);
  }

  return contents;
};
