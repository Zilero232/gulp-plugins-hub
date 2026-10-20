import { describe, expect, it } from 'vitest';

import { isUrl } from '../..';

describe('isUrl', () => {
  it('tells URLs from paths, drive letters included', () => {
    expect(['file:///a.ts', 'webpack://app/a.ts', 'data:text/plain,x'].map(isUrl)).toEqual([true, true, true]);
    expect(['a.ts', '/a.ts', 'C:\\a.ts', 'D:/a.ts'].map(isUrl)).toEqual([false, false, false, false]);
  });
});
