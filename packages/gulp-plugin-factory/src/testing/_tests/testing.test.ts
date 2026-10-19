import path from 'node:path';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';

import { createFile, getContents, getRelativePath, runPlugin } from '..';

describe('createFile', () => {
  it('creates a buffer file under /project/src by default', () => {
    const file = createFile({ path: 'a/b.txt', contents: 'hi' });

    expect(file).toMatchObject({
      cwd: path.normalize('/project'),
      base: path.join('/project', 'src'),
      path: path.join('/project', 'src', 'a', 'b.txt')
    });
    expect(getRelativePath(file)).toBe('a/b.txt');
    expect(file.contents?.toString()).toBe('hi');
  });

  it('creates null and stream files', () => {
    expect(createFile({ contents: null }).isNull()).toBe(true);
    expect(createFile({ contents: new PassThrough() }).isStream()).toBe(true);
  });

  it('initializes a source map like src({ sourcemaps: true })', () => {
    expect(createFile({ path: 'a.js', contents: 'x', sourceMap: true }).sourceMap).toEqual({
      version: 3,
      file: 'a.js',
      names: [],
      mappings: '',
      sources: ['a.js'],
      sourcesContent: ['x']
    });
  });
});

describe('runPlugin', () => {
  it('collects every file the stream emits', async () => {
    const files = [createFile({ path: 'a.txt' }), createFile({ path: 'b.txt' })];

    expect(await runPlugin(new PassThrough({ objectMode: true }), files)).toEqual(files);
  });
});

describe('getContents', () => {
  it('returns the Buffer contents and throws for anything else', () => {
    expect(getContents(createFile({ contents: 'a' })).toString()).toBe('a');
    expect(() => getContents(createFile({ contents: null }))).toThrow('got another file');
    expect(() => getContents(undefined)).toThrow('got nothing');
  });
});

describe('getRelativePath', () => {
  it('throws without a file', () => {
    expect(() => getRelativePath(undefined)).toThrow('Expected a file, got nothing');
  });
});
