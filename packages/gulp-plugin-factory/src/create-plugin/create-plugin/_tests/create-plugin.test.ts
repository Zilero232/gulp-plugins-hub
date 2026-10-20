import path from 'node:path';
import { PassThrough } from 'node:stream';
import PluginError from 'plugin-error';
import { describe, expect, it } from 'vitest';

import { createPlugin } from '../..';
import { createFile, runPlugin } from '../../../testing';

const contentsOf = (files: { contents: unknown }[]) => files.map(({ contents }) => String(contents));

describe('createPlugin', () => {
  it('passes the changed file on when transform returns nothing', async () => {
    const plugin = createPlugin({
      name: 'gulp-upper',
      transform: (file) => {
        file.contents = Buffer.from(file.contents.toString().toUpperCase());
      }
    });

    const output = await runPlugin(plugin, [createFile({ contents: 'a' }), createFile({ contents: 'b' })]);

    expect(contentsOf(output)).toEqual(['A', 'B']);
  });

  it('drops the file when transform returns null', async () => {
    const plugin = createPlugin({ name: 'gulp-drop', transform: (file) => (file.stem === 'drop' ? null : file) });

    const output = await runPlugin(plugin, [createFile({ path: 'drop.txt' }), createFile({ path: 'keep.txt' })]);

    expect(output.map(({ basename }) => basename)).toEqual(['keep.txt']);
  });

  it('emits every file of a returned array', async () => {
    const plugin = createPlugin({
      name: 'gulp-twice',
      transform: async (file) => {
        const copy = file.clone();

        copy.stem = `${file.stem}-copy`;

        return [file, copy];
      }
    });

    const output = await runPlugin(plugin, [createFile({ path: 'a.txt' })]);

    expect(output.map(({ basename }) => basename)).toEqual(['a.txt', 'a-copy.txt']);
  });

  it('keeps the order of files across async transforms', async () => {
    const plugin = createPlugin({
      name: 'gulp-slow',
      transform: async (file) => {
        await new Promise((resolve) => setTimeout(resolve, file.stem === 'first' ? 20 : 0));
      }
    });

    const output = await runPlugin(plugin, [createFile({ path: 'first.txt' }), createFile({ path: 'second.txt' })]);

    expect(output.map(({ stem }) => stem)).toEqual(['first', 'second']);
  });

  it('passes files without contents through untouched', async () => {
    const seen: string[] = [];
    const plugin = createPlugin({ name: 'gulp-seen', transform: (file) => void seen.push(file.path) });
    const empty = createFile({ contents: null });

    const output = await runPlugin(plugin, [empty]);

    expect(output).toEqual([empty]);
    expect(seen).toEqual([]);
  });

  it('passes files the filter rejects through untouched', async () => {
    const plugin = createPlugin({
      name: 'gulp-css-only',
      filter: (file) => file.extname === '.css',
      transform: () => null
    });

    const output = await runPlugin(plugin, [createFile({ path: 'a.css' }), createFile({ path: 'a.js' })]);

    expect(output.map(({ basename }) => basename)).toEqual(['a.js']);
  });

  it('emits a PluginError when the filter throws', async () => {
    const plugin = createPlugin({
      name: 'gulp-bad-filter',
      filter: () => {
        throw new Error('filter failed');
      }
    });

    await expect(runPlugin(plugin, [createFile()])).rejects.toMatchObject({
      plugin: 'gulp-bad-filter',
      message: 'filter failed'
    });
  });

  it('emits a PluginError for streamed contents', async () => {
    const plugin = createPlugin({ name: 'gulp-buffers', transform: () => undefined });

    const run = runPlugin(plugin, [createFile({ contents: new PassThrough() })]);

    await expect(run).rejects.toThrow(PluginError);
    await expect(run).rejects.toMatchObject({ plugin: 'gulp-buffers', message: 'Streaming is not supported' });
  });

  it('gives every file to transform when accept is "any"', async () => {
    const kinds: string[] = [];

    const plugin = createPlugin({
      name: 'gulp-any',
      accept: 'any',
      transform: (file) => void kinds.push(file.isNull() ? 'null' : file.isStream() ? 'stream' : 'buffer')
    });

    await runPlugin(plugin, [
      createFile({ contents: null }),
      createFile({ contents: new PassThrough() }),
      createFile()
    ]);

    expect(kinds).toEqual(['null', 'stream', 'buffer']);
  });

  it('wraps errors thrown in transform with the plugin name and file path', async () => {
    const plugin = createPlugin({
      name: 'gulp-broken',
      transform: () => {
        throw new Error('boom');
      }
    });

    const error = await runPlugin(plugin, [createFile({ path: 'a.txt' })]).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(PluginError);

    expect(error).toMatchObject({
      plugin: 'gulp-broken',
      message: 'boom',
      fileName: path.join('/project', 'src', 'a.txt')
    });
  });

  it('wraps thrown non-errors too', async () => {
    const plugin = createPlugin({
      name: 'gulp-string',
      // eslint-disable-next-line prefer-promise-reject-errors -- a rejection that is not an Error is wrapped too
      transform: () => Promise.reject('plain string')
    });

    await expect(runPlugin(plugin, [createFile()])).rejects.toMatchObject({ message: 'plain string' });
  });

  it('keeps a PluginError thrown by transform as it is', async () => {
    const original = new PluginError('gulp-inner', 'inner');

    const plugin = createPlugin({
      name: 'gulp-outer',
      transform: () => {
        throw original;
      }
    });

    await expect(runPlugin(plugin, [createFile()])).rejects.toBe(original);
  });

  it('runs flush after the last file and emits what it pushes', async () => {
    const names: string[] = [];

    const plugin = createPlugin({
      name: 'gulp-collect',
      transform: (file) => {
        names.push(file.stem);

        return null;
      },
      flush: ({ push }) => push(createFile({ path: 'all.txt', contents: names.join(',') }))
    });

    const output = await runPlugin(plugin, [createFile({ path: 'a.txt' }), createFile({ path: 'b.txt' })]);

    expect(contentsOf(output)).toEqual(['a,b']);
  });

  it('emits a PluginError when flush fails', async () => {
    const plugin = createPlugin({
      name: 'gulp-flush',
      flush: async () => {
        throw new Error('flush failed');
      }
    });

    await expect(runPlugin(plugin, [])).rejects.toMatchObject({ plugin: 'gulp-flush', message: 'flush failed' });
  });

  it('passes every file through when there is no transform', async () => {
    const file = createFile();

    expect(await runPlugin(createPlugin({ name: 'gulp-noop' }), [file])).toEqual([file]);
  });

  it('lets transform push extra files through the context', async () => {
    const plugin = createPlugin({
      name: 'gulp-extra',
      transform: (file, { push, name }) => {
        push(createFile({ path: `${name}.txt` }));

        return file;
      }
    });

    const output = await runPlugin(plugin, [createFile({ path: 'a.txt' })]);

    expect(output.map(({ basename }) => basename)).toEqual(['gulp-extra.txt', 'a.txt']);
  });

  it('transforms only the listed extensions, whatever their case', async () => {
    const plugin = createPlugin({
      name: 'gulp-css',
      extensions: ['.css'],
      transform: (file) => {
        file.contents = Buffer.from('changed');
      }
    });

    const output = await runPlugin(plugin, [
      createFile({ path: 'a.CSS', contents: 'a' }),
      createFile({ path: 'b.js', contents: 'b' })
    ]);

    expect(contentsOf(output)).toEqual(['changed', 'b']);
  });

  it('refuses binary files read as UTF-8 text', async () => {
    const plugin = createPlugin({ name: 'gulp-png', binary: true, transform: () => undefined });
    const corrupted = Buffer.from(Buffer.from('\x89PNG\r\n\x1A\n', 'latin1').toString('utf8'));

    await expect(runPlugin(plugin, [createFile({ path: 'a.png', contents: corrupted })])).rejects.toMatchObject({
      plugin: 'gulp-png',
      message: expect.stringContaining('a.png was read as UTF-8 text')
    });
  });

  it('disposes once when the stream ends', async () => {
    let disposed = 0;
    const plugin = createPlugin({ name: 'gulp-dispose', dispose: () => void disposed++ });

    await runPlugin(plugin, [createFile()]);
    await new Promise((resolve) => setImmediate(resolve));

    expect(disposed).toBe(1);
  });

  it('disposes when the stream is destroyed before it ends', async () => {
    let disposed = 0;
    const plugin = createPlugin({ name: 'gulp-dispose', dispose: async () => void disposed++ });

    plugin.write(createFile());
    plugin.destroy();
    await new Promise((resolve) => plugin.once('close', resolve));

    expect(disposed).toBe(1);
  });

  it('disposes and emits the error when a file fails', async () => {
    let disposed = 0;

    const plugin = createPlugin({
      name: 'gulp-fail',
      transform: () => {
        throw new Error('broken');
      },
      dispose: () => void disposed++
    });

    await expect(runPlugin(plugin, [createFile()])).rejects.toMatchObject({ message: 'broken' });
    await new Promise((resolve) => setImmediate(resolve));

    expect(disposed).toBe(1);
  });
});
