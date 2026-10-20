import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { getInputFormat, isCff, isFontFile } from '..';

describe('getInputFormat', () => {
  it('maps font extensions in any case', () => {
    expect(getInputFormat('.TTF')).toBe('ttf');
    expect(getInputFormat('.woff2')).toBe('woff2');
    expect(getInputFormat('.css')).toBeUndefined();
  });
});

describe('isFontFile', () => {
  it('takes SVG fonts and leaves other SVG files out', () => {
    expect(isFontFile(createFile({ path: 'a.svg', contents: '<svg><defs><font id="x"/></defs></svg>' }))).toBe(true);
    expect(isFontFile(createFile({ path: 'icon.svg', contents: '<svg><path d="M0 0"/></svg>' }))).toBe(false);

    expect(isFontFile(createFile({ path: 'text.svg', contents: '<svg><font-face font-family="x"/></svg>' }))).toBe(
      false
    );

    expect(isFontFile(createFile({ path: 'a.otf', contents: 'x' }))).toBe(true);
  });
});

describe('isCff', () => {
  it('tells CFF outlines from TrueType ones by the signature', () => {
    expect(isCff(Buffer.from('OTTO\0\0'))).toBe(true);
    expect(isCff(Buffer.from([0, 1, 0, 0]))).toBe(false);
  });
});
