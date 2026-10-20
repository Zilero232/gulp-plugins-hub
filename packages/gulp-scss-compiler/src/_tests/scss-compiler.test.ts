import { PluginError } from '@zilero/gulp-plugin-factory';
import { createFile, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import scssCompiler from '..';

let base: string;

beforeAll(async () => {
  base = await realpath(await mkdtemp(path.join(tmpdir(), 'scss-compiler-')));
  await mkdir(path.join(base, 'config'));
  await writeFile(path.join(base, 'config', '_variables.scss'), '$brand: #7c3aed;\n');
});

afterAll(() => rm(base, { recursive: true, force: true }));

const file = (relative: string, contents: string, sourceMap = false) =>
  createFile({ base, cwd: base, path: relative, contents, sourceMap });

const compile = (options: Parameters<typeof scssCompiler>[0], files: ReturnType<typeof file>[]) =>
  runPlugin(scssCompiler(options), files);

describe('scssCompiler', () => {
  it('compiles SCSS from the file contents to .css', async () => {
    const [output] = await compile({}, [file('main.scss', '.a { .b { color: red; } }')]);

    expect(getRelativePath(output)).toBe('main.css');
    expect(String(output!.contents)).toBe('.a .b {\n  color: red;\n}');
  });

  it('compiles indented Sass', async () => {
    const [output] = await compile({}, [file('main.sass', '.a\n  color: blue\n')]);

    expect(String(output!.contents)).toBe('.a {\n  color: blue;\n}');
  });

  it('resolves @use relative to the file and from the base', async () => {
    const source = "@use 'config/variables' as v;\n.a { color: v.$brand; }";
    const output = await compile({ sassOptions: { style: 'compressed' } }, [
      file('main.scss', source),
      file('pages/home.scss', "@use '../config/variables' as v;\n.b { color: v.$brand; }")
    ]);

    expect(output.map((css) => String(css.contents))).toEqual(['.a{color:#7c3aed}', '.b{color:#7c3aed}']);
  });

  it('drops partials unless skipPartials is false', async () => {
    expect(await compile({}, [file('_mixins.scss', '.a { color: red; }')])).toEqual([]);
    expect(await compile({ skipPartials: false }, [file('_mixins.scss', '.a { color: red; }')])).toHaveLength(1);
  });

  it('runs the hooks before and after Sass', async () => {
    const [output] = await compile(
      {
        sassOptions: { style: 'compressed' },
        onBeforeCompile: ({ content }) => `$color: green;\n${content}`,
        onAfterCompile: async ({ content, file: { basename } }) => `/* ${basename} */${content}`
      },
      [file('main.scss', '.a { color: $color; }')]
    );

    expect(String(output!.contents)).toBe('/* main.css */.a{color:green}');
  });

  it('adds a source map relative to the base when the file has one', async () => {
    const [output] = await compile({}, [
      file('main.scss', "@use 'config/variables' as v;\n.a { color: v.$brand; }", true)
    ]);

    expect(output!.sourceMap.file).toBe('main.css');
    expect([...output!.sourceMap.sources].sort()).toEqual(['config/_variables.scss', 'main.scss']);
    expect(output!.sourceMap.mappings).not.toBe('');
  });

  it('leaves plain CSS alone', async () => {
    const [output] = await compile({}, [file('vendor.css', 'a  {  }')]);

    expect(String(output!.contents)).toBe('a  {  }');
  });

  it('emits a PluginError for invalid Sass and stops the compiler', async () => {
    const run = compile({}, [file('broken.scss', '.a { color: $missing; }')]);

    await expect(run).rejects.toBeInstanceOf(PluginError);
    await expect(run).rejects.toMatchObject({ fileName: path.join(base, 'broken.scss'), lineNumber: 1 });
    await expect(run).rejects.toThrow(/^Undefined variable\./);
  });

  it('points errors in a partial at the partial and its line', async () => {
    await writeFile(path.join(base, 'config', '_broken.scss'), '$ok: 1;\n.a { width: 1px + 1s; }\n');

    const run = compile({}, [file('main.scss', "@use 'config/broken';")]);

    await expect(run).rejects.toMatchObject({ fileName: path.join(base, 'config', '_broken.scss'), lineNumber: 2 });
  });
});
