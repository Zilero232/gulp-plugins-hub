import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { PassThrough, Readable } from 'node:stream';
import { gunzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

import archiveCreator from '..';
import { resolveArchive } from '../archive';

const files = () => [
  createFile({ path: 'index.html', contents: '<h1>hi</h1>' }),
  createFile({ path: 'css/main.css', contents: 'a{}' })
];

/** Entry names and contents of an uncompressed tar: 512-byte headers, contents padded to 512 bytes. */
const readTar = (buffer: Buffer) => {
  const entries: Record<string, string> = {};

  for (let offset = 0; offset + 512 <= buffer.length && buffer[offset] !== 0;) {
    const name = buffer.toString('utf8', offset, offset + 100).replace(/\0.*$/s, '');
    const size = Number.parseInt(
      buffer
        .toString('utf8', offset + 124, offset + 136)
        .replace(/\0.*$/s, '')
        .trim(),
      8
    );

    entries[name] = buffer.toString('utf8', offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
  }

  return entries;
};

describe('archiveCreator', () => {
  it('packs every file into one zip named relative to the first base', async () => {
    const output = await runPlugin(archiveCreator({ name: 'site.zip', archiverOptions: { store: true } }), files());

    expect(output).toHaveLength(1);
    expect(getRelativePath(output[0])).toBe('site.zip');

    const zip = getContents(output[0]);
    expect(zip.subarray(0, 4)).toEqual(Buffer.from('PK\x03\x04', 'latin1'));
    expect(zip.toString('latin1')).toContain('css/main.css');
    expect(zip.toString('latin1')).toContain('<h1>hi</h1>');
  });

  it('writes a tar with the relative paths and contents', async () => {
    const [archive] = await runPlugin(archiveCreator({ name: 'site.tar' }), files());

    expect(readTar(getContents(archive))).toEqual({ 'index.html': '<h1>hi</h1>', 'css/main.css': 'a{}' });
  });

  it('gzips tgz archives and adds the extension to a bare name', async () => {
    const [archive] = await runPlugin(archiveCreator({ name: 'releases/site', format: 'tgz' }), files());

    expect(getRelativePath(archive)).toBe('releases/site.tar.gz');
    expect(readTar(gunzipSync(getContents(archive)))).toHaveProperty('css/main.css', 'a{}');
  });

  it('archives streamed contents', async () => {
    const stream = new PassThrough();
    stream.end('streamed');

    const [archive] = await runPlugin(archiveCreator({ name: 'a.tar' }), [
      createFile({ path: 's.txt', contents: stream })
    ]);

    expect(readTar(getContents(archive))).toEqual({ 's.txt': 'streamed' });
  });

  it('emits a PluginError when streamed contents fail, instead of crashing', async () => {
    const broken = new Readable({
      read() {
        this.destroy(new Error('disk read failed'));
      }
    });

    const run = runPlugin(archiveCreator({ name: 'a.tar' }), [createFile({ path: 'x.txt', contents: broken })]);

    await expect(run).rejects.toMatchObject({ plugin: '@zilero/gulp-archive-creator', message: 'disk read failed' });
  });

  it('adds directory entries only when asked', async () => {
    const directory = createFile({ path: 'empty', contents: null });
    directory.stat = Object.assign(Object.create(null), { isDirectory: () => true, mode: 0o40755 });

    const [without] = await runPlugin(archiveCreator({ name: 'a.tar' }), [directory, createFile({ path: 'x.txt' })]);
    const [withDirectories] = await runPlugin(archiveCreator({ name: 'a.tar', directories: true }), [directory]);

    expect(Object.keys(readTar(getContents(without)))).toEqual(['x.txt']);
    expect(Object.keys(readTar(getContents(withDirectories)))).toEqual(['empty/']);
  });

  it('skips the base folder itself as a directory entry', async () => {
    const base = createFile({ path: '', contents: null });
    base.stat = Object.assign(Object.create(null), { isDirectory: () => true, mode: 0o40755 });

    const [archive] = await runPlugin(archiveCreator({ name: 'a.tar', directories: true }), [
      base,
      createFile({ path: 'x.txt' })
    ]);

    expect(Object.keys(readTar(getContents(archive)))).toEqual(['x.txt']);
  });

  it('emits nothing for an empty stream unless emptyArchive is set', async () => {
    expect(await runPlugin(archiveCreator(), [])).toEqual([]);

    const [empty] = await runPlugin(archiveCreator({ emptyArchive: true }), []);
    expect(empty!.basename).toBe('archive.zip');
  });

  it('resolves the format from the name', () => {
    expect(resolveArchive({ name: 'a.TGZ' })).toEqual({ format: 'tgz', fileName: 'a.TGZ' });
    expect(resolveArchive({ name: 'a.tar.gz' })).toEqual({ format: 'tgz', fileName: 'a.tar.gz' });
    expect(resolveArchive({ name: 'a' })).toEqual({ format: 'zip', fileName: 'a.zip' });
    expect(resolveArchive({ name: 'a.zip', format: 'tar' })).toEqual({ format: 'tar', fileName: 'a.zip' });
  });

  it('rejects an absolute name or an unknown format', () => {
    expect(() => archiveCreator({ name: '/tmp/a.zip' })).toThrow('Expected a path inside the output folder');
    expect(() => archiveCreator({ name: '../a.zip' })).toThrow('Expected a path inside the output folder');
    // @ts-expect-error: rar is not a format
    expect(() => archiveCreator({ format: 'rar' })).toThrow(/Invalid options/);
  });
});
