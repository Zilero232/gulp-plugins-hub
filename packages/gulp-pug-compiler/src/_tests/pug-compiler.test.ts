import { PluginError } from '@zilero/gulp-plugin-factory';
import { createFile, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import pugCompiler from '..';

let base: string;

beforeAll(async () => {
  base = await realpath(await mkdtemp(path.join(tmpdir(), 'pug-compiler-')));
  await mkdir(path.join(base, 'templates'));
  await writeFile(path.join(base, 'templates', '_layout.pug'), 'html\n  body\n    block content\n');
  await writeFile(path.join(base, 'templates', '_nav.pug'), 'nav Menu\n');
});

afterAll(() => rm(base, { recursive: true, force: true }));

const compile = async (options: Parameters<typeof pugCompiler>[0], contents: string, relative = 'pages/index.pug') => {
  const output = await runPlugin(pugCompiler(options), [createFile({ base, cwd: base, path: relative, contents })]);
  return output;
};

describe('pugCompiler', () => {
  it('renders the file contents to .html', async () => {
    const [file] = await compile({}, 'h1.title Hello');

    expect(getRelativePath(file)).toBe('pages/index.html');
    expect(String(file!.contents)).toBe('<h1 class="title">Hello</h1>');
  });

  it('resolves extends and includes from the file path, and absolute ones from the base', async () => {
    const source = 'extends ../templates/_layout.pug\nblock content\n  include /templates/_nav.pug\n  p Body\n';
    const [file] = await compile({}, source);

    expect(String(file!.contents)).toBe('<html><body><nav>Menu</nav><p>Body</p></body></html>');
  });

  it('renders with data, or with data returned for each file', async () => {
    const [fromObject] = await compile({ data: { name: 'World' } }, 'p Hello #{name}');
    const [fromFunction] = await compile({ data: async ({ file }) => ({ name: file.stem }) }, 'p Hello #{name}');

    expect(String(fromObject!.contents)).toBe('<p>Hello World</p>');
    expect(String(fromFunction!.contents)).toBe('<p>Hello index</p>');
  });

  it('passes pug options through', async () => {
    const [file] = await compile({ pugOptions: { pretty: true } }, 'div\n  p a');

    expect(String(file!.contents)).toBe('\n<div>\n  <p>a</p>\n</div>');
  });

  it('runs onBeforeCompile on the template source', async () => {
    const [file] = await compile({ onBeforeCompile: ({ content }) => content.replace('TITLE', 'Home') }, 'h1 TITLE');

    expect(String(file!.contents)).toBe('<h1>Home</h1>');
  });

  it('uses the given extension and runs the hook', async () => {
    const [file] = await compile({ extname: '.php', onAfterCompile: ({ content }) => `<?php ?>${content}` }, 'p a');

    expect(file!.extname).toBe('.php');
    expect(String(file!.contents)).toBe('<?php ?><p>a</p>');
  });

  it('drops partials unless skipPartials is false', async () => {
    expect(await compile({}, 'p a', 'templates/_mixins.pug')).toEqual([]);
    expect(await compile({ skipPartials: false }, 'p a', 'templates/_mixins.pug')).toHaveLength(1);
  });

  it('leaves other files alone', async () => {
    const [file] = await compile({}, 'h1 not pug', 'readme.md');

    expect(String(file!.contents)).toBe('h1 not pug');
  });

  it('quotes the compiled text in runtime errors, not a file on disk', async () => {
    const run = compile({ onBeforeCompile: () => 'p= missing.deep.value' }, 'p ok', 'pages/virtual.pug');

    await expect(run).rejects.toThrow(/missing\.deep\.value/);
    await expect(run).rejects.not.toThrow(/ENOENT/);
  });

  it('emits a PluginError for invalid templates', async () => {
    await expect(compile({}, 'p(class=')).rejects.toBeInstanceOf(PluginError);
  });

  it('rejects an extension without its dot', () => {
    expect(() => pugCompiler({ extname: 'html' })).toThrow('Expected an extension with its dot');
  });
});
