import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { isFontFile } from '../..';

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
