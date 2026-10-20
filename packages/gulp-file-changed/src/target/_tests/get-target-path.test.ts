import { createFile } from '@zilero/gulp-plugin-factory/testing';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { getTargetPath } from '..';

const file = createFile({ path: 'css/main.scss' });
const destination = path.join('/out', 'dist');

describe('getTargetPath', () => {
  it('keeps the relative path, changes the extension, or takes the target', () => {
    expect(getTargetPath({ file, destination })).toBe(path.join(destination, 'css', 'main.scss'));
    expect(getTargetPath({ file, destination, extname: '.css' })).toBe(path.join(destination, 'css', 'main.css'));

    expect(getTargetPath({ file, destination, extname: '.css', target: () => 'all.css' })).toBe(
      path.resolve(destination, 'all.css')
    );
  });
});
