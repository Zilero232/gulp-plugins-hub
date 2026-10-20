import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';

import { createFile, runPlugin } from '../..';

describe('runPlugin', () => {
  it('collects every file the stream emits', async () => {
    const files = [createFile({ path: 'a.txt' }), createFile({ path: 'b.txt' })];

    expect(await runPlugin(new PassThrough({ objectMode: true }), files)).toEqual(files);
  });
});
