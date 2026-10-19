import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { getPathParts, renamePath } from '..';

const file = createFile({ path: 'css/theme.min.css' });
const parts = getPathParts(file);

describe('getPathParts', () => {
  it('splits at the last extension', () => {
    expect(parts).toEqual({ dirname: 'css', stem: 'theme.min', extname: '.css' });
  });
});

describe('renamePath', () => {
  it('handles a file name, an object and a function', async () => {
    expect(await renamePath({ parts, rename: 'a.js', file })).toEqual({ dirname: 'css', stem: 'a', extname: '.js' });
    expect(await renamePath({ parts, rename: { prefix: 'x-', extname: 'scss' }, file })).toEqual({
      dirname: 'css',
      stem: 'x-theme.min',
      extname: '.scss'
    });
    expect(await renamePath({ parts, rename: () => ({ extname: 'txt' }), file })).toMatchObject({ extname: '.txt' });
  });
});
