import { createFile, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import folderClone from '..';

const run = (options: Parameters<typeof folderClone>[0]) =>
  runPlugin(folderClone(options), [createFile({ path: 'img/logo.png', contents: 'png' })]);

describe('folderClone', () => {
  it('emits the original and a copy in every folder', async () => {
    const output = await run({ dirs: ['backup', 'v2/assets'] });

    expect(output.map(getRelativePath)).toEqual(['img/logo.png', 'backup/img/logo.png', 'v2/assets/img/logo.png']);
  });

  it('accepts a single folder and can drop the original', async () => {
    const output = await run({ dirs: 'mirror', keepOriginal: false });

    expect(output.map(getRelativePath)).toEqual(['mirror/img/logo.png']);
  });

  it('makes independent copies', async () => {
    const [original, copy] = await run({ dirs: 'copy' });

    copy!.contents = Buffer.from('changed');

    expect(String(original!.contents)).toBe('png');
    expect(copy!.base).toBe(original!.base);
  });

  it('lets onClone change, replace or skip each copy', async () => {
    const output = await run({
      dirs: ['keep', 'skip', 'replace'],
      onClone: ({ file, dir, original }) => {
        if (dir === 'skip') {
          return null;
        }

        if (dir === 'replace') {
          return createFile({ path: `replaced-${original.basename}` });
        }

        file.stem = `${file.stem}-${dir}`;
      }
    });

    expect(output.map(getRelativePath)).toEqual(['img/logo.png', 'keep/img/logo-keep.png', 'replaced-logo.png']);
  });

  it('gives each copy a source map of its own, pointing at the copy', async () => {
    const output = await runPlugin(folderClone({ dirs: ['a', 'b'] }), [
      createFile({ path: 'app.js', sourceMap: true })
    ]);

    expect(output.map((file) => file.sourceMap.file)).toEqual(['app.js', 'a/app.js', 'b/app.js']);
  });

  it('points the map of a copy renamed in onClone at its new name', async () => {
    const output = await runPlugin(
      folderClone({
        dirs: 'v2',
        keepOriginal: false,
        onClone: ({ file }) => {
          file.stem = 'renamed';
        }
      }),
      [createFile({ path: 'js/app.js', sourceMap: true })]
    );

    expect(output.map((file) => file.sourceMap.file)).toEqual(['v2/js/renamed.js']);
  });

  it('rejects a folder listed twice', () => {
    expect(() => folderClone({ dirs: ['backup', './backup/'] })).toThrow('Each folder may be listed only once');
  });

  it('rejects folders outside the base, the base itself and an empty list', () => {
    for (const dirs of ['/tmp', '.', '../up']) {
      expect(() => folderClone({ dirs })).toThrow('Expected a folder inside file.base');
    }

    expect(() => folderClone({ dirs: [] })).toThrow('Add at least one folder');
  });
});
