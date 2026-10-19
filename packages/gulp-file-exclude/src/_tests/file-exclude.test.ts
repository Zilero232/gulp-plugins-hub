import type { Vinyl } from '@zilero/gulp-plugin-factory';

import { createFile, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import fileExclude from '..';

const files = () => [
  createFile({ path: 'app.js', contents: 'x'.repeat(10) }),
  createFile({ path: 'app.js.map', contents: 'x'.repeat(100) }),
  createFile({ path: 'drafts/post.md', contents: 'x'.repeat(50) }),
  createFile({ path: 'img/.hidden.png', contents: 'x' })
];

const kept = async (options: Parameters<typeof fileExclude>[0], input: Vinyl[] = files()) =>
  (await runPlugin(fileExclude(options), input)).map(getRelativePath);

describe('fileExclude', () => {
  it('drops files whose name matches a glob without a slash, in any directory', async () => {
    expect(await kept({ patterns: '*.map' })).toEqual(['app.js', 'drafts/post.md', 'img/.hidden.png']);
  });

  it('matches globs with a slash against the relative path, dotfiles included', async () => {
    expect(await kept({ patterns: ['drafts/**', 'img/*.png'] })).toEqual(['app.js', 'app.js.map']);
  });

  it('matches regular expressions against the relative path', async () => {
    expect(await kept({ patterns: [/^drafts\//, /\.png$/] })).toEqual(['app.js', 'app.js.map']);
  });

  it('matches a global regular expression against every file from the start', async () => {
    const input = [createFile({ path: 'a.map' }), createFile({ path: 'b.map' }), createFile({ path: 'c.map' })];

    expect(await kept({ patterns: /\.map$/g }, input)).toEqual([]);
  });

  it('drops files outside the size range', async () => {
    expect(await kept({ size: { min: 5, max: 60 } })).toEqual(['app.js', 'drafts/post.md']);
  });

  it('uses the size on disk for files read without contents and keeps files of unknown size', async () => {
    const onDisk = createFile({ path: 'big.bin', contents: null });
    onDisk.stat = Object.assign(Object.create(null), { size: 500 });

    expect(await kept({ size: { max: 100 } }, [onDisk, createFile({ path: 'dir', contents: null })])).toEqual(['dir']);
  });

  it('never drops directories by size', async () => {
    const directory = createFile({ path: 'assets', contents: null });
    directory.stat = Object.assign(Object.create(null), { size: 4096, isDirectory: () => true });

    expect(await kept({ size: { max: 100 } }, [directory])).toEqual(['assets']);
  });

  it('drops files the predicate returns true for, awaiting promises', async () => {
    expect(await kept({ exclude: async ({ file }) => file.stem === 'app' })).toEqual([
      'app.js.map',
      'drafts/post.md',
      'img/.hidden.png'
    ]);
  });

  it('combines every rule', async () => {
    expect(await kept({ patterns: '*.map', size: { min: 2 }, exclude: ({ file }) => file.extname === '.md' })).toEqual([
      'app.js'
    ]);
  });

  it('rejects options that exclude nothing or a reversed size range', () => {
    expect(() => fileExclude({})).toThrow('Set at least one of patterns, size or exclude');
    expect(() => fileExclude({ patterns: [] })).toThrow('Add at least one pattern');
    expect(() => fileExclude({ patterns: '!*.min.js' })).toThrow('Negated globs are not supported');
    expect(() => fileExclude({ patterns: 'drafts\\*.md' })).toThrow('Expected / in globs');
    expect(() => fileExclude({ patterns: '/project/src/drafts/**' })).toThrow('not an absolute path');
    expect(() => fileExclude({ size: { min: 10, max: 1 } })).toThrow('min must not be greater than max');
  });
});
