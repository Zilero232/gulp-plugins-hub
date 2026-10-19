import { createFile, getRelativePath } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { cloneInto } from '..';

describe('cloneInto', () => {
  it('moves a deep copy under the folder, with a source map of its own', () => {
    const original = createFile({ path: 'img/a.js', contents: 'x', sourceMap: true });
    const copy = cloneInto({ original, dir: 'mirror' });

    expect(getRelativePath(copy)).toBe('mirror/img/a.js');
    expect(copy.sourceMap).not.toBe(original.sourceMap);
    expect(original.sourceMap.file).toBe('img/a.js');
  });
});
