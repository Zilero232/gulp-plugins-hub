import type { Vinyl } from '@zilero/gulp-plugin-factory';

import { PluginError } from '@zilero/gulp-plugin-factory';
import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { createFont } from 'fonteditor-core';
import { describe, expect, it } from 'vitest';

import fontSwitcher from '..';
import { fontverter } from '../vendor';

// A three-glyph font written for the tests, so no font file with a license of its own is needed.
const SVG_FONT = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg"><defs>
<font id="TestSans" horiz-adv-x="500">
  <font-face font-family="TestSans" units-per-em="1000" ascent="800" descent="-200"/>
  <missing-glyph horiz-adv-x="500" d="M0 0h500v700h-500z"/>
  <glyph glyph-name="A" unicode="A" d="M0 0l250 700l250 -700z"/>
  <glyph glyph-name="B" unicode="B" d="M0 0h400v700h-400z"/>
  <glyph glyph-name="C" unicode="C" d="M0 0h500v100h-500z"/>
</font></defs></svg>`;

const TTF = Buffer.from(createFont(SVG_FONT, { type: 'svg' }).write({ type: 'ttf', toBuffer: true }));

const MAGIC = { ttf: '00010000', woff: '774f4646', woff2: '774f4632' };

const magic = (file: Vinyl | undefined) => getContents(file).subarray(0, 4).toString('hex');

/** The code points a font maps, read the lossless way: any container to sfnt, then parsed. */
const unicodes = async (file: Vinyl | undefined) => {
  const sfnt = await fontverter.convert(getContents(file), 'sfnt');

  return createFont(sfnt, { type: 'ttf' })
    .get()
    .glyf.flatMap((glyph) => glyph.unicode ?? [])
    .sort((a, b) => a - b);
};

const ttfFile = () => createFile({ path: 'fonts/test.ttf', contents: TTF });

describe('fontSwitcher', () => {
  it('converts a font into every requested format', async () => {
    const output = await runPlugin(fontSwitcher({ formats: ['woff2', 'woff', 'eot', 'svg'] }), [ttfFile()]);

    expect(output.map(getRelativePath)).toEqual([
      'fonts/test.woff2',
      'fonts/test.woff',
      'fonts/test.eot',
      'fonts/test.svg'
    ]);
    expect(magic(output[0])).toBe(MAGIC.woff2);
    expect(magic(output[1])).toBe(MAGIC.woff);
    expect(getContents(output[3]).toString()).toContain('<font');
    expect(await unicodes(output[0])).toEqual([65, 66, 67]);
  });

  it('keeps only the glyphs of the subset', async () => {
    const [fromString] = await runPlugin(fontSwitcher({ formats: 'woff', subset: 'AB' }), [ttfFile()]);
    const [fromCodePoints] = await runPlugin(fontSwitcher({ formats: 'ttf', subset: [67] }), [ttfFile()]);

    expect(await unicodes(fromString)).toEqual([65, 66]);
    expect(await unicodes(fromCodePoints)).toEqual([67]);
  });

  it('reads woff2, woff and svg fonts', async () => {
    const [woff2] = await runPlugin(fontSwitcher({ formats: 'woff2' }), [ttfFile()]);
    const fromWoff2 = await runPlugin(fontSwitcher({ formats: 'ttf' }), [
      createFile({ path: 'a.woff2', contents: getContents(woff2) })
    ]);
    const fromSvg = await runPlugin(fontSwitcher({ formats: 'ttf' }), [
      createFile({ path: 'b.svg', contents: SVG_FONT })
    ]);

    expect(magic(fromWoff2[0])).toBe(MAGIC.ttf);
    expect(await unicodes(fromSvg[0])).toEqual([65, 66, 67]);
  });

  it('keeps the source font when asked', async () => {
    const output = await runPlugin(fontSwitcher({ formats: 'woff', keepOriginal: true }), [ttfFile()]);

    expect(output.map(({ basename }) => basename)).toEqual(['test.ttf', 'test.woff']);
    expect(getContents(output[0])).toEqual(TTF);
  });

  it('does not convert the source to its own format again when keeping it', async () => {
    const output = await runPlugin(fontSwitcher({ formats: ['ttf', 'woff'], keepOriginal: true }), [ttfFile()]);

    expect(output.map(({ basename }) => basename)).toEqual(['test.ttf', 'test.woff']);
  });

  it('subsets the source format too when keeping the original with a subset', async () => {
    const output = await runPlugin(fontSwitcher({ formats: ['ttf', 'woff'], subset: 'A', keepOriginal: true }), [
      ttfFile()
    ]);

    expect(output.map(getRelativePath)).toEqual(['fonts/test.ttf', 'fonts/test.woff']);
    expect(await unicodes(output[0])).toEqual([65]);
  });

  it('writes each format once and takes code points up to U+10FFFF', async () => {
    const output = await runPlugin(fontSwitcher({ formats: ['woff', 'woff'] }), [ttfFile()]);

    expect(output).toHaveLength(1);
    expect(() => fontSwitcher({ formats: 'woff', subset: [1_114_112] })).toThrow('Expected a Unicode code point');
  });

  it('leaves SVG images that are not fonts alone', async () => {
    const icon = createFile({
      path: 'icon.svg',
      contents: '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1v1z"/></svg>'
    });
    const [output] = await runPlugin(fontSwitcher({ formats: 'woff' }), [icon]);

    expect(output!.basename).toBe('icon.svg');
  });

  it('leaves files that are not fonts alone', async () => {
    const [css] = await runPlugin(fontSwitcher({ formats: 'woff' }), [createFile({ path: 'a.css', contents: 'a{}' })]);

    expect(getContents(css).toString()).toBe('a{}');
  });

  it('emits a PluginError for a broken font, for example one read as UTF-8', async () => {
    const corrupted = createFile({ path: 'broken.ttf', contents: Buffer.from(TTF.toString('utf8')) });

    const run = runPlugin(fontSwitcher({ formats: 'woff' }), [corrupted]);

    await expect(run).rejects.toBeInstanceOf(PluginError);
    await expect(run).rejects.toThrow('Read binary files with `src(globs, { encoding: false })`');
  });

  it('rejects unknown formats and an empty list', () => {
    // @ts-expect-error: otf is read, not written
    expect(() => fontSwitcher({ formats: 'otf' })).toThrow(/Invalid options/);
    expect(() => fontSwitcher({ formats: [] })).toThrow('Add at least one format');
  });
});
