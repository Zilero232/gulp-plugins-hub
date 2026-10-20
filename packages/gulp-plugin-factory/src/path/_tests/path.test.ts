import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { createPathMatcher, isRelativePathInside, isUrl, toPosixPath } from '..';

describe('toPosixPath', () => {
  it('joins the segments with /', () => {
    expect(toPosixPath(['css', 'main.css'].join(path.sep))).toBe('css/main.css');
  });
});

describe('isRelativePathInside', () => {
  it('accepts relative paths inside the folder', () => {
    expect(isRelativePathInside('css/main.css')).toBe(true);
    expect(isRelativePathInside('a/../b')).toBe(true);
  });

  it('rejects absolute and drive-relative paths, the folder itself and paths that leave it', () => {
    for (const value of ['/tmp/x', 'C:x', 'c:\\x', '.', './', '..', '../x', 'a/../../x']) {
      expect(isRelativePathInside(value)).toBe(false);
    }
  });
});

describe('isUrl', () => {
  it('tells URLs from paths, drive letters included', () => {
    expect(['file:///a.ts', 'webpack://app/a.ts', 'data:text/plain,x'].map(isUrl)).toEqual([true, true, true]);
    expect(['a.ts', '/a.ts', 'C:\\a.ts', 'D:/a.ts'].map(isUrl)).toEqual([false, false, false, false]);
  });
});

describe('createPathMatcher', () => {
  it('matches name globs anywhere, path globs from the base and regular expressions', () => {
    const matches = createPathMatcher({ patterns: ['*.map', 'drafts/**', /\.tmp$/] });

    expect(['a/b.js.map', 'drafts/x/y.md', 'c.tmp', 'src/drafts/z.md', 'keep.js'].map(matches)).toEqual([
      true,
      true,
      true,
      false,
      false
    ]);
  });

  it('matches paths with the separators of the OS', () => {
    expect(createPathMatcher({ patterns: ['drafts/**'] })(path.join('drafts', 'a.md'))).toBe(true);
  });

  it('restarts global regular expressions on every path', () => {
    const matches = createPathMatcher({ patterns: [/\.md$/g] });

    expect([matches('a.md'), matches('b.md')]).toEqual([true, true]);
  });

  it('ignores the case of globs when asked', () => {
    expect(createPathMatcher({ patterns: ['*.png'] })('A.PNG')).toBe(false);
    expect(createPathMatcher({ patterns: ['*.png', 'img/**'], ignoreCase: true })('IMG/A.PNG')).toBe(true);
  });
});
