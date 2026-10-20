import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { getFileSize, isOutsideSizeRange } from '..';

describe('getFileSize and isOutsideSizeRange', () => {
  it('measures contents and leaves unknown sizes in range', () => {
    expect(getFileSize(createFile({ contents: 'abc' }))).toBe(3);
    expect(isOutsideSizeRange({ size: 3, range: { min: 4 } })).toBe(true);
    expect(isOutsideSizeRange({ size: undefined, range: { max: 1 } })).toBe(false);
  });
});
