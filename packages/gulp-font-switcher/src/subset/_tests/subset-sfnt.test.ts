import { createFont } from 'fonteditor-core';
import { describe, expect, it } from 'vitest';

import { subsetSfnt } from '..';

const SVG_FONT = `<svg xmlns="http://www.w3.org/2000/svg"><defs><font id="T" horiz-adv-x="500">
  <font-face font-family="T" units-per-em="1000" ascent="800" descent="-200"/>
  <glyph unicode="A" d="M0 0l250 700l250 -700z"/><glyph unicode="B" d="M0 0h400v700h-400z"/>
</font></defs></svg>`;

const ttf = Buffer.from(createFont(SVG_FONT, { type: 'svg' }).write({ type: 'ttf', toBuffer: true }));

const unicodes = (font: Buffer) =>
  createFont(font, { type: 'ttf' })
    .get()
    .glyf.flatMap((glyph) => glyph.unicode ?? []);

describe('subsetSfnt', () => {
  it('keeps the glyphs of a string or of code points, even a large list', async () => {
    expect(unicodes(await subsetSfnt({ sfnt: ttf, subset: 'B', hinting: true }))).toEqual([66]);

    const many = Array.from({ length: 200_000 }, (_, index) => index);

    expect(unicodes(await subsetSfnt({ sfnt: ttf, subset: many, hinting: false })).sort()).toEqual([65, 66]);
  });
});
