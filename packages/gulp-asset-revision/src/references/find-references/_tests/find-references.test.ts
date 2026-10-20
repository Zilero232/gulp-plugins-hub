import { describe, expect, it } from 'vitest';

import { findReferences } from '../..';

const assets = new Set(['img/a.png', 'b.png', 'css/img/a.png']);

describe('findReferences', () => {
  it('returns nothing without assets', () => {
    expect(findReferences({ content: '"a.png"', fromDir: '.', assets: new Set() })).toEqual([]);
  });

  it('resolves each reference to its asset', () => {
    expect(findReferences({ content: 'url(../b.png)', fromDir: 'css', assets })).toEqual([
      { start: 4, end: 12, target: 'b.png', fileRelative: true }
    ]);
  });
});
