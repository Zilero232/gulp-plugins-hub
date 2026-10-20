import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { getPathParts } from '../..';

const file = createFile({ path: 'css/theme.min.css' });
const parts = getPathParts(file);

describe('getPathParts', () => {
  it('splits at the last extension', () => {
    expect(parts).toEqual({ dirname: 'css', stem: 'theme.min', extname: '.css' });
  });
});
