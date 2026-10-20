import type { Stats } from 'node:fs';

import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { getComparer } from '..';

const stats = (mtimeMs: number): Stats => Object.assign(Object.create(null), { mtimeMs });

describe('getComparer', () => {
  it('compares modification times in whole milliseconds', async () => {
    const file = createFile();

    file.stat = stats(1000.75);

    expect(await getComparer('mtime')({ file, target: { path: 'x', stat: stats(1000) } })).toBe(false);
    expect(await getComparer('mtime')({ file, target: { path: 'x', stat: stats(999) } })).toBe(true);
  });

  it('returns the function it is given', () => {
    const compare = () => true;

    expect(getComparer(compare)).toBe(compare);
  });
});
