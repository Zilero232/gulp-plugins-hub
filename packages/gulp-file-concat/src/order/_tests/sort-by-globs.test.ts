import type { BufferFile } from '@zilero/gulp-plugin-factory';

import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { sortByGlobs } from '..';

const files = ['main.js', 'lib/x.js', 'vendor/v.js', 'lib/y.js']
  .map((path) => createFile({ path }))
  .filter((file): file is BufferFile => file.isBuffer());

describe('sortByGlobs', () => {
  it('puts files in the order of the first glob they match, stably, the rest last', () => {
    const sorted = sortByGlobs({ files, order: ['vendor/**', 'lib/**'] });

    expect(sorted.map(({ stem }) => stem)).toEqual(['v', 'x', 'y', 'main']);
  });
});
