import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { isFunction, isObject, isRelativePathInside, toPosixPath } from '..';

describe('toPosixPath', () => {
  it('joins the segments with /', () => {
    expect(toPosixPath(['css', 'main.css'].join(path.sep))).toBe('css/main.css');
  });
});

describe('isFunction', () => {
  it('tells functions from everything else', () => {
    expect(isFunction(() => 1)).toBe(true);
    expect(isFunction(async () => 1)).toBe(true);
    expect(isFunction({})).toBe(false);
  });
});

describe('isRelativePathInside', () => {
  it('accepts relative paths inside the folder', () => {
    expect(isRelativePathInside('css/main.css')).toBe(true);
    expect(isRelativePathInside('a/../b')).toBe(true);
  });

  it('rejects absolute paths, the folder itself and paths that leave it', () => {
    for (const value of ['/tmp/x', '.', './', '..', '../x', 'a/../../x']) {
      expect(isRelativePathInside(value)).toBe(false);
    }
  });
});

describe('isObject', () => {
  it('accepts plain objects only', () => {
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject('x')).toBe(false);
  });
});
