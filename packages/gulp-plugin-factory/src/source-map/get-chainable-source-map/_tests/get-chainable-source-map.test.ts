import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import { getChainableSourceMap } from '../..';
import { createFile } from '../../../testing';

describe('getChainableSourceMap', () => {
  it('makes the sources absolute file URLs, honoring sourceRoot', () => {
    const file = createFile({ path: 'js/app.js' });

    file.sourceMap = {
      version: 3,
      sourceRoot: 'src',
      sources: ['app.ts', 'https://cdn.example/x.js'],
      names: [],
      mappings: 'AAAA'
    };

    expect(getChainableSourceMap(file)?.sources).toEqual([
      pathToFileURL(path.resolve(file.base, 'src', 'app.ts')).href,
      'https://cdn.example/x.js'
    ]);
  });

  it('is undefined without mappings', () => {
    expect(getChainableSourceMap(createFile({ contents: 'x', sourceMap: true }))).toBeUndefined();
  });
});
