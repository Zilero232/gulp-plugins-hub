import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import fileConcat from '..';

const files = (sourceMap = false) => [
  createFile({ path: 'js/a.js', contents: 'const a = 1;', sourceMap }),
  createFile({ path: 'js/vendor/b.js', contents: 'const b = 2;', sourceMap })
];

describe('fileConcat', () => {
  it('joins the files in stream order with a line break', async () => {
    const output = await runPlugin(fileConcat({ name: 'bundle.js' }), files());

    expect(output).toHaveLength(1);
    expect(getRelativePath(output[0])).toBe('bundle.js');
    expect(getContents(output[0]).toString()).toBe('const a = 1;\nconst b = 2;');
  });

  it('uses the separator, header and footer', async () => {
    const [output] = await runPlugin(
      fileConcat({
        name: 'dist/app.js',
        separator: ';\n',
        header: ({ files: inputs }) => `/* ${inputs.length} files */\n`,
        footer: async () => '\n/* end */'
      }),
      files()
    );

    expect(getRelativePath(output)).toBe('dist/app.js');
    expect(getContents(output).toString()).toBe('/* 2 files */\nconst a = 1;;\nconst b = 2;\n/* end */');
  });

  it('orders the files by the first glob they match, keeping stream order otherwise', async () => {
    const input = [
      createFile({ path: 'main.js', contents: 'main' }),
      createFile({ path: 'lib/x.js', contents: 'x' }),
      createFile({ path: 'vendor/v.js', contents: 'v' }),
      createFile({ path: 'lib/y.js', contents: 'y' })
    ];

    const [output] = await runPlugin(fileConcat({ name: 'all.js', order: ['vendor/**', 'lib/**'] }), input);

    expect(getContents(output).toString()).toBe('v\nx\ny\nmain');
  });

  it('creates a source map pointing at every input when the files have one', async () => {
    const [output] = await runPlugin(fileConcat({ name: 'bundle.js' }), files(true));

    expect(output!.sourceMap).toMatchObject({
      file: 'bundle.js',
      sources: ['js/a.js', 'js/vendor/b.js'],
      sourcesContent: ['const a = 1;', 'const b = 2;']
    });
  });

  it('joins files with the same relative path from different bases', async () => {
    const input = [
      createFile({ base: '/project/src/vendor', path: 'index.js', contents: 'vendor' }),
      createFile({ base: '/project/src/app', path: 'index.js', contents: 'app', sourceMap: true })
    ];

    const [output] = await runPlugin(fileConcat({ name: 'all.js' }), input);

    expect(getContents(output).toString()).toBe('vendor\napp');
    expect(output!.sourceMap.sources).toEqual(['index.js', '../app/index.js']);
  });

  it('chains the source map each input already has', async () => {
    const compiled = createFile({ path: 'js/a.js', contents: 'const a = 1;' });

    compiled.sourceMap = {
      version: 3,
      sources: ['ts/a.ts'],
      names: [],
      mappings: 'AAAA',
      sourcesContent: ['const a: number = 1;']
    };

    const [output] = await runPlugin(fileConcat({ name: 'bundle.js' }), [
      compiled,
      createFile({ path: 'js/b.js', contents: 'b' })
    ]);

    expect(output!.sourceMap.sources).toEqual(['ts/a.ts', 'js/b.js']);
  });

  it('chains input maps when the bundle goes into a folder', async () => {
    const compiled = createFile({ path: 'js/a.js', contents: 'const a = 1;' });

    compiled.sourceMap = { version: 3, sources: ['ts/a.ts'], names: [], mappings: 'AAAA' };

    const [output] = await runPlugin(fileConcat({ name: 'vendor/bundle.js' }), [
      compiled,
      createFile({ path: 'js/b.js', contents: 'b' })
    ]);

    expect(output!.sourceMap).toMatchObject({ file: 'vendor/bundle.js', sources: ['ts/a.ts', 'js/b.js'] });
  });

  it('gives inputs with the same path and different contents their own source names', async () => {
    const input = [
      createFile({ path: 'a.js', contents: 'one', sourceMap: true }),
      createFile({ path: 'a.js', contents: 'two', sourceMap: true }),
      createFile({ path: 'a.js', contents: 'one', sourceMap: true })
    ];

    const [output] = await runPlugin(fileConcat({ name: 'all.js' }), input);

    expect(getContents(output).toString()).toBe('one\ntwo\none');
    expect(output!.sourceMap).toMatchObject({ sources: ['a.js', 'a.js?2'], sourcesContent: ['one', 'two'] });
  });

  it('strips the byte order mark of every input', async () => {
    const input = [
      createFile({ path: 'a.css', contents: '\uFEFFa{}' }),
      createFile({ path: 'b.css', contents: '\uFEFFb{}' })
    ];

    const [output] = await runPlugin(fileConcat({ name: 'all.css' }), input);

    expect(getContents(output).toString()).toBe('a{}\nb{}');
  });

  it('gives the bundle the stat of the newest input', async () => {
    const [older, newer] = files();

    older!.stat = await stat(fileURLToPath(import.meta.url));
    newer!.stat = await stat(fileURLToPath(import.meta.url));
    Object.assign(older!.stat, { mtime: new Date('2026-01-01'), mtimeMs: Date.parse('2026-01-01') });
    Object.assign(newer!.stat, { mtime: new Date('2026-06-01'), mtimeMs: Date.parse('2026-06-01') });

    const [output] = await runPlugin(fileConcat({ name: 'bundle.js' }), [newer!, older!]);

    expect(output!.stat?.mtimeMs).toBe(Date.parse('2026-06-01'));
    expect(output!.stat).not.toBe(newer!.stat);
    expect(output!.isDirectory()).toBe(false);
    expect((await runPlugin(fileConcat({ name: 'bundle.js' }), files()))[0]!.stat).toBeNull();
  });

  it('emits nothing for an empty stream and passes files without contents through', async () => {
    expect(await runPlugin(fileConcat({ name: 'x.js' }), [])).toEqual([]);

    const directory = createFile({ path: 'dir', contents: null });

    expect(await runPlugin(fileConcat({ name: 'x.js' }), [directory])).toEqual([directory]);
  });

  it('rejects a missing or absolute name', () => {
    // @ts-expect-error: name is required
    expect(() => fileConcat({})).toThrow(/Invalid options/);
    expect(() => fileConcat({ name: '/tmp/x.js' })).toThrow('Expected a path inside the output folder');
  });
});
