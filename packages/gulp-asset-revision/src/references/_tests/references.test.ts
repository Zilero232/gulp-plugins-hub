import { describe, expect, it } from 'vitest';

import { findReferences, rewriteReferences } from '..';

const assets = new Set(['img/a.png', 'b.png', 'css/img/a.png']);
const revisions = { 'img/a.png': 'img/a-1.png', 'b.png': 'b-2.png', 'css/img/a.png': 'css/img/a-3.png' };

const rewrite = (content: string, fromDir = '.') => rewriteReferences({ content, fromDir, assets, revisions });

describe('rewriteReferences', () => {
  it('rewrites base-relative, root-relative and ./ references', () => {
    expect(rewrite('"img/a.png" \'/img/a.png\' url(./img/a.png) src=img/a.png')).toBe(
      '"img/a-1.png" \'/img/a-1.png\' url(./img/a-1.png) src=img/a-1.png'
    );
  });

  it('rewrites references relative to the file, written relative to it', () => {
    expect(rewrite('url(../img/a.png) url("../b.png")', 'css')).toBe('url(../img/a-1.png) url("../b-2.png")');
  });

  it('prefers the asset next to the file for a bare path, and the base for a root-relative one', () => {
    expect(rewrite('url(img/a.png) url(/img/a.png)', 'css')).toBe('url(img/a-3.png) url(/img/a-1.png)');
  });

  it('rewrites unquoted attributes of minified HTML and CSS without quotes', () => {
    expect(rewrite('<link href=/img/a.png><img src=img/a.png alt> .a{background:url(img/a.png);mask:url(b.png)}')).toBe(
      '<link href=/img/a-1.png><img src=img/a-1.png alt> .a{background:url(img/a-1.png);mask:url(b-2.png)}'
    );
  });

  it('keeps query strings and hashes, and leaves lookalikes alone', () => {
    expect(rewrite('"img/a.png?v=1" "img/a.png#x" "other/img/a.png" "img/a.png.bak" "xb.png"')).toBe(
      '"img/a-1.png?v=1" "img/a-1.png#x" "other/img/a.png" "img/a.png.bak" "xb.png"'
    );
  });

  it('leaves references to assets without a revision as they are', () => {
    expect(rewriteReferences({ content: '"img/a.png"', fromDir: '.', assets, revisions: {} })).toBe('"img/a.png"');
  });
});

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
