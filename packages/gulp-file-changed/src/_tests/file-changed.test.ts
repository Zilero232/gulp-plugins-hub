import type { Vinyl } from '@zilero/gulp-plugin-factory';

import { createFile, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { mkdir, mkdtemp, realpath, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import vfs from 'vinyl-fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import fileChanged from '..';

let cwd: string;

beforeEach(async () => {
  cwd = await realpath(await mkdtemp(path.join(tmpdir(), 'file-changed-')));
  await mkdir(path.join(cwd, 'dist', 'css'), { recursive: true });
});

afterEach(() => rm(cwd, { recursive: true, force: true }));

const writeBuilt = async ({ relative, contents, mtime }: { relative: string; contents: string; mtime: Date }) => {
  const target = path.join(cwd, 'dist', relative);

  await writeFile(target, contents);
  await utimes(target, mtime, mtime);
};

/** A source file on disk, with the stat `gulp.src` would give it. */
const source = async ({ relative, contents, mtime }: { relative: string; contents: string; mtime: Date }) => {
  const sourcePath = path.join(cwd, 'src', relative);

  await mkdir(path.dirname(sourcePath), { recursive: true });
  await writeFile(sourcePath, contents);
  await utimes(sourcePath, mtime, mtime);

  const file = createFile({ cwd, base: path.join(cwd, 'src'), path: relative, contents });

  file.stat = await stat(sourcePath);

  return file;
};

const passed = async (options: Parameters<typeof fileChanged>[0], files: Vinyl[]) =>
  (await runPlugin(fileChanged(options), files)).map(getRelativePath);

const OLD = new Date('2026-01-01');
const NEW = new Date('2026-06-01');

describe('fileChanged', () => {
  it('passes files that were never built', async () => {
    expect(await passed({ dest: 'dist' }, [await source({ relative: 'a.txt', contents: 'a', mtime: OLD })])).toEqual([
      'a.txt'
    ]);
  });

  it('drops files older than the built ones and passes newer ones', async () => {
    await writeBuilt({ relative: 'old.txt', contents: 'x', mtime: NEW });
    await writeBuilt({ relative: 'new.txt', contents: 'x', mtime: OLD });

    const files = [
      await source({ relative: 'old.txt', contents: 'x', mtime: OLD }),
      await source({ relative: 'new.txt', contents: 'x', mtime: NEW })
    ];

    expect(await passed({ dest: 'dist' }, files)).toEqual(['new.txt']);
  });

  it('compares the built file with the new extension', async () => {
    await writeBuilt({ relative: 'css/main.css', contents: 'x', mtime: NEW });

    expect(
      await passed({ dest: 'dist', extname: '.css' }, [
        await source({ relative: 'css/main.scss', contents: 'x', mtime: OLD })
      ])
    ).toEqual([]);
  });

  it('compares with the target path a function returns', async () => {
    await writeBuilt({ relative: 'css/renamed.css', contents: 'x', mtime: NEW });

    const file = await source({ relative: 'css/main.scss', contents: 'x', mtime: OLD });

    expect(await passed({ dest: 'dist', extname: '.min.css', target: () => 'css/renamed.css' }, [file])).toEqual([]);
  });

  it('accepts an absolute target path', async () => {
    await writeBuilt({ relative: 'css/abs.css', contents: 'x', mtime: NEW });

    const file = await source({ relative: 'css/main.scss', contents: 'x', mtime: OLD });

    expect(await passed({ dest: 'dist', target: () => path.join(cwd, 'dist', 'css', 'abs.css') }, [file])).toEqual([]);
  });

  it('fails on errors other than a missing built file', async () => {
    const file = await source({ relative: 'a.txt', contents: 'a', mtime: NEW });

    await expect(passed({ dest: 'dist', target: () => 'a.txt\0bad' }, [file])).rejects.toMatchObject({
      plugin: '@zilero/gulp-file-changed'
    });
  });

  it('passes files when dest points at a file instead of a folder', async () => {
    await writeBuilt({ relative: 'a.txt', contents: 'a', mtime: NEW });

    const file = await source({ relative: 'a.txt', contents: 'a', mtime: OLD });

    expect(await passed({ dest: path.join('dist', 'a.txt') }, [file])).toEqual(['a.txt']);
  });

  it('passes every file when an extra file is newer than its built file', async () => {
    await mkdir(path.join(cwd, 'src', 'partials'), { recursive: true });
    await writeBuilt({ relative: 'a.txt', contents: 'a', mtime: NEW });
    await writeBuilt({ relative: 'b.txt', contents: 'b', mtime: OLD });

    const partial = path.join(cwd, 'src', 'partials', '_vars.txt');

    const files = async () => [
      await source({ relative: 'a.txt', contents: 'a', mtime: OLD }),
      await source({ relative: 'b.txt', contents: 'b', mtime: OLD })
    ];

    await writeFile(partial, 'v');
    await utimes(partial, OLD, OLD);

    expect(await passed({ dest: 'dist', extra: 'src/partials/*.txt' }, await files())).toEqual([]);

    await utimes(partial, new Date('2026-03-01'), new Date('2026-03-01'));

    expect(await passed({ dest: 'dist', extra: ['src/partials/*.txt', 'missing/*'] }, await files())).toEqual([
      'b.txt'
    ]);

    expect(await passed({ dest: 'dist', extra: 'nothing/*.txt' }, await files())).toEqual([]);
  });

  it('compares contents when asked', async () => {
    await writeBuilt({ relative: 'same.txt', contents: 'same', mtime: OLD });
    await writeBuilt({ relative: 'other.txt', contents: 'before', mtime: OLD });

    const files = [
      await source({ relative: 'same.txt', contents: 'same', mtime: NEW }),
      await source({ relative: 'other.txt', contents: 'after', mtime: NEW })
    ];

    expect(await passed({ dest: 'dist', compare: 'contents' }, files)).toEqual(['other.txt']);
  });

  it('takes the destination and the comparison from functions', async () => {
    await writeBuilt({ relative: 'a.txt', contents: 'a', mtime: OLD });

    const options = {
      dest: ({ file }: { file: Vinyl }) => (file.stem === 'a' ? 'dist' : 'elsewhere'),
      compare: () => false
    };

    const files = [
      await source({ relative: 'a.txt', contents: 'a', mtime: NEW }),
      await source({ relative: 'b.txt', contents: 'b', mtime: NEW })
    ];

    expect(await passed(options, files)).toEqual(['b.txt']);
  });

  it('drops files that dest wrote unchanged, whatever the precision of the file system', async () => {
    // Written as an editor would: the file system keeps the time to the nanosecond.
    await mkdir(path.join(cwd, 'src'), { recursive: true });

    for (const name of ['a', 'b', 'c']) {
      await writeFile(path.join(cwd, 'src', `${name}.txt`), name);
    }

    // dest keeps the modification time in whole milliseconds; the sources keep a fraction of one.
    await pipeline(vfs.src('src/*.txt', { cwd }), vfs.dest('dist', { cwd }));

    const plugin = fileChanged({ dest: 'dist' });
    const passed = plugin.toArray();

    await pipeline(vfs.src('src/*.txt', { cwd }), plugin);

    expect(await passed).toEqual([]);
  });

  it('passes files without a stat and directories', async () => {
    await writeBuilt({ relative: 'a.txt', contents: 'a', mtime: NEW });

    const noStat = createFile({ cwd, base: path.join(cwd, 'src'), path: 'a.txt', contents: 'a' });
    const directory = createFile({ cwd, base: path.join(cwd, 'src'), path: 'css', contents: null });

    directory.stat = await stat(path.join(cwd, 'dist', 'css'));

    expect(await passed({ dest: 'dist' }, [noStat, directory])).toEqual(['a.txt', 'css']);
  });

  it('rejects an extension without its dot', () => {
    expect(() => fileChanged({ dest: 'dist', extname: 'css' })).toThrow('Expected an extension with its dot');
  });
});
