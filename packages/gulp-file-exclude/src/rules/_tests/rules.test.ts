import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { createPathMatcher, getFileSize, isOutsideSizeRange } from '..';

describe('createPathMatcher', () => {
  it('matches name globs anywhere, path globs from the base and regular expressions', () => {
    const matches = createPathMatcher(['*.map', 'drafts/**', /\.tmp$/]);

    expect(['a/b.js.map', 'drafts/x/y.md', 'c.tmp', 'src/drafts/z.md', 'keep.js'].map(matches)).toEqual([
      true,
      true,
      true,
      false,
      false
    ]);
  });
});

describe('getFileSize and isOutsideSizeRange', () => {
  it('measures contents and leaves unknown sizes in range', () => {
    expect(getFileSize(createFile({ contents: 'abc' }))).toBe(3);
    expect(isOutsideSizeRange({ size: 3, range: { min: 4 } })).toBe(true);
    expect(isOutsideSizeRange({ size: undefined, range: { max: 1 } })).toBe(false);
  });
});
