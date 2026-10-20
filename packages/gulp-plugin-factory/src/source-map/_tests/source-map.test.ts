import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import { applySourceMap, getChainableSourceMap, getInputSourceMap, syncSourceMapFile } from '..';
import { createFile } from '../../testing';

const map = (sources: string[]) => ({ version: 3, names: [], mappings: 'AAAA', sources });

describe('applySourceMap', () => {
  it('stores the map with the relative file name', () => {
    const file = createFile({ path: 'css/main.css' });

    applySourceMap({ file, map: map(['css/main.scss']) });

    expect(file.sourceMap).toEqual({ ...map(['css/main.scss']), file: 'css/main.css' });
  });

  it('makes absolute and file:// sources relative to the base', () => {
    const file = createFile({ path: 'css/main.css' });
    const absolute = path.join(file.base, 'css', '_vars.scss');

    applySourceMap({ file, map: map([absolute, pathToFileURL(path.join(file.base, 'css/main.scss')).href]) });

    expect(file.sourceMap.sources).toEqual(['css/_vars.scss', 'css/main.scss']);
  });

  it('accepts the map as JSON', () => {
    const file = createFile({ path: 'app.js' });

    applySourceMap({ file, map: JSON.stringify(map(['app.js'])) });

    expect(file.sourceMap).toMatchObject({ file: 'app.js', mappings: 'AAAA' });
  });
});

describe('getInputSourceMap', () => {
  it('returns the map as JSON when it has mappings', () => {
    const file = createFile({ path: 'app.js' });

    file.sourceMap = map(['src/app.ts']);

    expect(getInputSourceMap(file)).toBe(JSON.stringify(map(['src/app.ts'])));
  });

  it('returns undefined without a map or with empty mappings', () => {
    expect(getInputSourceMap(createFile())).toBeUndefined();
    expect(getInputSourceMap(createFile({ contents: 'x', sourceMap: true }))).toBeUndefined();
  });
});

describe('applySourceMap with chain', () => {
  it("chains the file's current map into the new one", () => {
    const file = createFile({ path: 'app.js' });

    // app.js line 1 comes from src/app.ts line 3.
    file.sourceMap = { version: 3, sources: ['src/app.ts'], names: [], mappings: 'AAEA' };

    // The new map: output line 2 comes from app.js line 1.
    applySourceMap({ file, map: { version: 3, sources: ['app.js'], names: [], mappings: ';AAAA' }, chain: true });

    expect(file.sourceMap).toMatchObject({ file: 'app.js', sources: ['src/app.ts'], mappings: ';AAEA' });
  });

  it('keeps chained sources relative to the base when the file is in a folder', () => {
    const file = createFile({ path: 'css/main.css' });

    file.sourceMap = { version: 3, sources: ['scss/main.scss'], names: [], mappings: 'AAAA' };

    applySourceMap({ file, map: { version: 3, sources: ['css/main.css'], names: [], mappings: 'AAAA' }, chain: true });

    expect(file.sourceMap.sources).toEqual(['scss/main.scss']);
  });

  it('keeps the original text from the empty map src() starts', () => {
    const file = createFile({ path: 'js/app.js', contents: 'const a = 1;', sourceMap: true });

    applySourceMap({ file, map: { version: 3, sources: ['js/app.js'], names: [], mappings: 'AAAA' }, chain: true });

    expect(file.sourceMap.sourcesContent).toEqual(['const a = 1;']);
  });

  it('chains only the source that is the file itself', () => {
    const file = createFile({ path: 'css/main.css' });

    file.sourceMap = { version: 3, sources: ['scss/main.scss'], names: [], mappings: 'AAAA' };

    // Line 1 comes from main.css, line 2 from an inlined import that has no map of its own.
    applySourceMap({
      file,
      map: { version: 3, sources: ['css/main.css', 'css/reset.css'], names: [], mappings: 'AAAA;ACAA' },
      chain: true
    });

    expect(file.sourceMap.sources).toEqual(['scss/main.scss', 'css/reset.css']);
  });

  it('keeps the new map when the file has nothing to chain', () => {
    const file = createFile({ path: 'app.js', contents: 'x', sourceMap: true });

    applySourceMap({ file, map: map(['app.js']), chain: true });

    expect(file.sourceMap).toMatchObject({ sources: ['app.js'], mappings: 'AAAA' });
  });
});

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

describe('syncSourceMapFile', () => {
  it("points the map at the file's new name and leaves files without a map alone", () => {
    const file = createFile({ path: 'a.js', contents: 'x', sourceMap: true });

    file.path = path.join(file.base, 'js', 'b.min.js');

    syncSourceMapFile(file);

    expect(file.sourceMap.file).toBe('js/b.min.js');

    const plain = createFile({ path: 'a.js' });

    syncSourceMapFile(plain);

    expect(plain.sourceMap).toBeUndefined();
  });
});
