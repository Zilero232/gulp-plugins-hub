import { createFile, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import refilename from '..';

const rename = async (options: Parameters<typeof refilename>[0], relative = 'js/app.js') => {
  const [file] = await runPlugin(refilename(options), [createFile({ path: relative, sourceMap: true })]);
  return file!;
};

describe('refilename', () => {
  it('replaces the file name with a string, keeping the directory', async () => {
    expect(getRelativePath(await rename('bundle.min.js'))).toBe('js/bundle.min.js');
  });

  it('adds a prefix and a suffix around the stem', async () => {
    expect(getRelativePath(await rename({ prefix: 'v2-', suffix: '.min' }))).toBe('js/v2-app.min.js');
  });

  it('changes the stem, the extension and the directory', async () => {
    expect(getRelativePath(await rename({ stem: 'main', extname: 'mjs', dirname: 'scripts/es' }))).toBe(
      'scripts/es/main.mjs'
    );
  });

  it('accepts the extension with its dot and removes it with an empty string', async () => {
    expect(getRelativePath(await rename({ extname: '.cjs' }))).toBe('js/app.cjs');
    expect(getRelativePath(await rename({ extname: '' }))).toBe('js/app');
  });

  it('moves files to the base with dirname "."', async () => {
    expect(getRelativePath(await rename({ dirname: '.' }))).toBe('app.js');
  });

  it('renames with a function of the path parts and the file', async () => {
    const file = await rename(({ parts, file: { stem } }) => ({
      stem: `${parts.stem}-${stem.length}`,
      dirname: 'out'
    }));

    expect(getRelativePath(file)).toBe('out/app-3.js');
  });

  it('gives the function the parts of a multi-extension file', async () => {
    let seen;

    await rename(({ parts }) => {
      seen = parts;
      return parts;
    }, 'css/theme.min.css');

    expect(seen).toEqual({ dirname: 'css', stem: 'theme.min', extname: '.css' });
  });

  it('awaits an async function and ignores parts it returns as undefined', async () => {
    const file = await rename(async () => ({ stem: undefined, extname: undefined, dirname: 'out' }));

    expect(getRelativePath(file)).toBe('out/app.js');
  });

  it('emits an error when the function returns parts that are not allowed', async () => {
    const run = runPlugin(
      refilename(() => ({ dirname: '../outside' })),
      [createFile({ path: 'a.js' })]
    );

    await expect(run).rejects.toThrow('The rename function returned invalid parts: Expected a folder inside the base');
  });

  it('never moves a file outside its base, whatever the function returns', async () => {
    const run = runPlugin(
      refilename(() => ({ stem: '..', extname: '' })),
      [createFile({ path: 'a.js' })]
    );

    await expect(run).rejects.toThrow(/Expected a file name without the extension|outside its base/);
  });

  it('points the source map at the new name', async () => {
    expect((await rename({ suffix: '.min' })).sourceMap.file).toBe('js/app.min.js');
  });

  it('renames files without contents too', async () => {
    const [file] = await runPlugin(refilename({ suffix: '-dir' }), [createFile({ path: 'assets', contents: null })]);

    expect(getRelativePath(file)).toBe('assets-dir');
  });

  it('rejects invalid options when the plugin is created', () => {
    expect(() => refilename('')).toThrow(/Invalid options/);
    expect(() => refilename('sub/app.js')).toThrow('Expected a file name without a folder');
    expect(() => refilename('..')).toThrow('Expected a file name');
    expect(() => refilename({ stem: '../../etc/passwd' })).toThrow('Expected part of a file name');
    expect(() => refilename({ prefix: '../' })).toThrow('Expected part of a file name');
    expect(() => refilename({ suffix: '/../x' })).toThrow('Expected part of a file name');
    expect(() => refilename({ stem: '' })).toThrow('Expected a file name without the extension');
    expect(() => refilename({ extname: '.' })).toThrow('Expected an extension');
    expect(() => refilename({ dirname: '../out' })).toThrow('Expected a folder inside the base');
    // @ts-expect-error: an unknown option
    expect(() => refilename({ stemm: 'x' })).toThrow(/Invalid options/);
  });
});
