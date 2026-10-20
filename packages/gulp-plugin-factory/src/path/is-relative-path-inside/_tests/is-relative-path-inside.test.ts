import { describe, expect, it } from 'vitest';

import { isRelativePathInside } from '../..';

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
