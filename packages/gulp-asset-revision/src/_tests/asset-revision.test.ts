import type { Vinyl } from '@zilero/gulp-plugin-factory';

import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import assetRevision from '..';

const hash = (contents: string, length = 10) => createHash('sha256').update(contents).digest('hex').slice(0, length);

const site = () => [
  createFile({
    path: 'index.html',
    contents: '<link href="/css/main.css"><img src="img/logo.png"><a href="about.html">'
  }),
  createFile({ path: 'css/main.css', contents: '.logo { background: url(../img/logo.png); }' }),
  createFile({ path: 'img/logo.png', contents: 'PNG' }),
  createFile({ path: 'js/app.js', contents: 'import("../css/main.css");' }),
  createFile({ path: 'js/app.js.map', contents: '{}' })
];

const byPath = (files: Vinyl[]) =>
  Object.fromEntries(files.map((file) => [getRelativePath(file), getContents(file).toString()]));

describe('assetRevision', () => {
  it('hashes assets, rewrites references and keeps pages and maps', async () => {
    const output = byPath(await runPlugin(assetRevision(), site()));

    const logo = `img/logo-${hash('PNG')}.png`;
    const css = `.logo { background: url(../${logo}); }`;
    const cssPath = `css/main-${hash(css)}.css`;
    const js = `import("../${cssPath}");`;

    expect(output).toEqual({
      'index.html': `<link href="/${cssPath}"><img src="${logo}"><a href="about.html">`,
      [cssPath]: css,
      [logo]: 'PNG',
      [`js/app-${hash(js)}.js`]: js,
      'js/app.js.map': '{}'
    });
  });

  it('emits a manifest of the revised paths', async () => {
    const output = await runPlugin(assetRevision({ manifest: { path: 'meta/rev.json' }, hashLength: 6 }), site());
    const manifest = output.find((file) => getRelativePath(file) === 'meta/rev.json');

    expect(JSON.parse(getContents(manifest).toString())).toEqual({
      'img/logo.png': `img/logo-${hash('PNG', 6)}.png`,
      'css/main.css': expect.stringMatching(/^css\/main-\w{6}\.css$/),
      'js/app.js': expect.stringMatching(/^js\/app-\w{6}\.js$/)
    });
  });

  it('only renames when rewrite is false', async () => {
    const output = byPath(await runPlugin(assetRevision({ rewrite: false, manifest: true }), site()));

    expect(output['index.html']).toContain('/css/main.css');
    expect(Object.keys(output)).toContain(`css/main-${hash('.logo { background: url(../img/logo.png); }')}.css`);
  });

  it('replaces the default exclude list with the given one', async () => {
    const output = await runPlugin(assetRevision({ exclude: ['img/**', '*.map'] }), site());
    const paths = output.map(getRelativePath);

    expect(paths).toEqual(expect.arrayContaining(['img/logo.png', 'js/app.js.map']));
    expect(paths).toContainEqual(expect.stringMatching(/^index-\w{10}\.html$/));
  });

  it('hashes an asset after every asset it references, whatever the stream order', async () => {
    const output = byPath(
      await runPlugin(assetRevision(), [
        createFile({ path: 'css/main.css', contents: '@import "theme.css"; .i { background: url(../img/icon.svg); }' }),
        createFile({ path: 'css/theme.css', contents: '.t { mask: url(../img/icon.svg); }' }),
        createFile({ path: 'img/icon.svg', contents: '<svg><image href="dot.png"/></svg>' }),
        createFile({ path: 'img/dot.png', contents: 'PNG' }),
        createFile({ path: 'js/app.js', contents: 'import("./chunk.js");' }),
        createFile({ path: 'js/chunk.js', contents: 'export {};' })
      ])
    );

    const dot = `img/dot-${hash('PNG')}.png`;
    const svg = `<svg><image href="${dot.replace('img/', '')}"/></svg>`;
    const icon = `img/icon-${hash(svg)}.svg`;
    const theme = `.t { mask: url(../${icon}); }`;
    const themePath = `css/theme-${hash(theme)}.css`;
    const main = `@import "${themePath.replace('css/', '')}"; .i { background: url(../${icon}); }`;
    const chunkPath = `js/chunk-${hash('export {};')}.js`;
    const app = `import("./${chunkPath.replace('js/', '')}");`;

    expect(output).toMatchObject({
      [dot]: 'PNG',
      [icon]: svg,
      [themePath]: theme,
      [`css/main-${hash(main)}.css`]: main,
      [`js/app-${hash(app)}.js`]: app
    });
  });

  it('keeps the names of files on a reference cycle, so every reference to them stays valid', async () => {
    const output = byPath(
      await runPlugin(assetRevision(), [
        createFile({ path: 'a.js', contents: 'import "./b.js"; import "./c.js";' }),
        createFile({ path: 'b.js', contents: 'import "./a.js";' }),
        createFile({ path: 'c.js', contents: 'export {};' }),
        createFile({ path: 'index.html', contents: '<script src="a.js"></script><script src="c.js"></script>' })
      ])
    );

    const c = `c-${hash('export {};')}.js`;

    expect(output).toEqual({
      [c]: 'export {};',
      'a.js': `import "./b.js"; import "./${c}";`,
      'b.js': 'import "./a.js";',
      'index.html': `<script src="a.js"></script><script src="${c}"></script>`
    });
  });

  it('keeps the name of a file that references itself', async () => {
    const worker = 'new Worker(new URL("./worker.js", import.meta.url));';
    const output = await runPlugin(assetRevision(), [createFile({ path: 'worker.js', contents: worker })]);

    expect(output.map(getRelativePath)).toEqual(['worker.js']);
    expect(getContents(output[0]).toString()).toBe(worker);
  });

  it('leaves a reference to an excluded file next to the page, rather than one of the same name at the base', async () => {
    const output = byPath(
      await runPlugin(assetRevision({ exclude: ['*.html', 'blog/logo.png'] }), [
        createFile({ path: 'blog/index.html', contents: '<img src="logo.png">' }),
        createFile({ path: 'blog/logo.png', contents: 'BLOG' }),
        createFile({ path: 'logo.png', contents: 'ROOT' })
      ])
    );

    expect(output['blog/index.html']).toBe('<img src="logo.png">');
  });

  it('points the source map of a renamed file at its new name', async () => {
    const file = createFile({ path: 'js/app.js', contents: 'x', sourceMap: true });
    const [output] = await runPlugin(assetRevision(), [file]);

    expect(output!.sourceMap.file).toBe(`js/app-${hash('x')}.js`);
  });

  it('ignores case in exclude globs', async () => {
    const output = await runPlugin(assetRevision(), [createFile({ path: 'INDEX.HTML', contents: '<p>' })]);

    expect(output.map(getRelativePath)).toEqual(['INDEX.HTML']);
  });

  it('writes rev-manifest.json with manifest: true', async () => {
    const output = await runPlugin(assetRevision({ manifest: true }), [createFile({ path: 'a.png', contents: 'PNG' })]);

    expect(getRelativePath(output.at(-1))).toBe('rev-manifest.json');
    expect(JSON.parse(getContents(output.at(-1)).toString())).toEqual({ 'a.png': `a-${hash('PNG')}.png` });
  });

  it('emits nothing for an empty stream', async () => {
    expect(await runPlugin(assetRevision({ manifest: true }), [])).toEqual([]);
  });

  it('rejects an invalid hash length', () => {
    expect(() => assetRevision({ hashLength: 2 })).toThrow(/Invalid options/);
    expect(() => assetRevision({ manifest: { path: '../rev.json' } })).toThrow(
      'Expected a path inside the output folder'
    );
  });
});
