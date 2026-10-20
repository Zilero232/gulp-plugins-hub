// The table tags of a WOFF2 font, read from its table directory (https://www.w3.org/TR/WOFF2/#table_dir_format),
// to check that a conversion kept the font's OpenType tables.
const KNOWN_TAGS = [
  'cmap',
  'head',
  'hhea',
  'hmtx',
  'maxp',
  'name',
  'OS/2',
  'post',
  'cvt ',
  'fpgm',
  'glyf',
  'loca',
  'prep',
  'CFF ',
  'VORG',
  'EBDT',
  'EBLC',
  'gasp',
  'hdmx',
  'kern',
  'LTSH',
  'PCLT',
  'VDMX',
  'vhea',
  'vmtx',
  'BASE',
  'GDEF',
  'GPOS',
  'GSUB',
  'EBSC',
  'JSTF',
  'MATH',
  'CBDT',
  'CBLC',
  'COLR',
  'CPAL',
  'SVG ',
  'sbix',
  'acnt',
  'avar',
  'bdat',
  'bloc',
  'bsln',
  'cvar',
  'fdsc',
  'feat',
  'fmtx',
  'fvar',
  'gvar',
  'hsty',
  'just',
  'lcar',
  'mort',
  'morx',
  'opbd',
  'prop',
  'trak',
  'Zapf',
  'Silf',
  'Glat',
  'Gloc',
  'Feat',
  'Sill'
];

const HEADER_LENGTH = 48;

// UIntBase128 bytes: 7 bits of value, and the high bit set when another byte follows.
const VALUE_BITS = 127;
const CONTINUE_BIT = 128;

// A table entry's flags: the known-tag index in the low 6 bits (63: the tag follows), the transform above.
const TAG_INDEX_BITS = 63;
const ARBITRARY_TAG = 63;

export const readWoff2Tables = (font: Buffer): string[] => {
  const tables: string[] = [];
  let offset = HEADER_LENGTH;

  const readBase128 = (): number => {
    let value = 0;

    for (let index = 0; index < 5; index++) {
      const byte = font[offset++] ?? 0;

      value = value * 128 + (byte & VALUE_BITS);

      if (!(byte & CONTINUE_BIT)) {
        return value;
      }
    }

    return value;
  };

  for (let table = 0; table < font.readUInt16BE(12); table++) {
    const flags = font[offset++] ?? 0;
    const tagIndex = flags & TAG_INDEX_BITS;

    const tag =
      tagIndex === ARBITRARY_TAG ? font.toString('latin1', offset, (offset += 4)) : (KNOWN_TAGS[tagIndex] ?? '?');

    const transform = flags >> 6;

    readBase128();

    // A transformLength follows when the table is transformed: version 3 is "none" for glyf and loca, version 0
    // for every other table.
    const isGlyphTable = tag === 'glyf' || tag === 'loca';

    if (isGlyphTable ? transform !== 3 : transform !== 0) {
      readBase128();
    }

    tables.push(tag.trim());
  }

  return tables.sort();
};
