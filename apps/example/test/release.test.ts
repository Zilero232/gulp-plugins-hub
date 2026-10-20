import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { readWoff2Tables } from './woff2-tables';

// Runs after `gulp release --production` (the `test` script): checks what the plugins built, from the packages'
// published dist/ files.
const ROOT = path.join(import.meta.dirname, '..');

const read = (file: string): Promise<Buffer> => readFile(path.join(ROOT, file));
const text = async (file: string): Promise<string> => (await read(file)).toString();

type SignatureInput = {
  file: string;
  length: number;
  offset?: number;
};

/** The bytes a format starts with, as text. */
const signature = async ({ file, length, offset = 0 }: SignatureInput): Promise<string> =>
  (await read(file)).subarray(offset, offset + length).toString('latin1');

/** Every file under a directory, relative to it, with `/` separators. */
const list = async (directory: string): Promise<string[]> => {
  const root = path.join(ROOT, directory);
  const entries = await readdir(root, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .sort();
};

describe('dist', () => {
  it('renders and minifies every page with its data', async () => {
    const html = await text('dist/about.html');

    expect(html).toMatch(/^<!doctype html>/);
    expect(html).not.toContain('\n    ');
    expect(html).toContain('<title>About · Example</title>');
    expect(html).toContain('<a class=active href=/about.html>About</a>');

    expect(await list('dist')).toEqual(
      expect.arrayContaining(['about.html', 'contact.html', 'index.html', 'services.html'])
    );
  });

  it('compiles, prefixes and minifies the styles, without source maps in production', async () => {
    const css = await text('dist/css/main.css');

    expect(css).toContain('@font-face{');
    // .browserslistrc includes browsers that need the prefix.
    expect(css).toContain('-webkit-user-select');
    expect(css).not.toMatch(/\n {2}/);
    expect(await list('dist/css')).toEqual(['main.css']);
  });

  it('bundles the app modules with esbuild', async () => {
    const js = await text('dist/js/app.js');

    expect(js).toContain('dataset.theme');
    expect(js).toContain('aria-current');
    expect(js).not.toMatch(/^import /m);
  });

  it('joins the vendor scripts in order, fills them in and minifies them', async () => {
    const js = await text('dist/js/vendor.js');

    expect(js.indexOf('structuredClone')).toBeLessThan(js.indexOf('dataLayer'));
    expect(js).toContain('G-EXAMPLE');
    expect(js).toContain('1.0.0');
    expect(js).not.toContain('__VERSION__');
    expect(js).not.toContain('\n  ');
  });

  it('converts the fonts to woff2 and woff, keeping their OpenType tables', async () => {
    const woff2 = await read('dist/fonts/F563-Regular.woff2');

    expect(woff2.toString('latin1', 0, 4)).toBe('wOF2');
    expect(readWoff2Tables(woff2)).toEqual(expect.arrayContaining(['GDEF', 'GPOS', 'GSUB', 'glyf', 'cmap']));

    expect(readWoff2Tables(await read('dist/fonts/SimpleTags-VGA2w.woff2'))).toEqual(
      expect.arrayContaining(['CFF', 'GSUB'])
    );

    expect(await signature({ file: 'dist/fonts/F563-Regular.woff', length: 4 })).toBe('wOFF');
  });

  it('optimizes the images, converts them and resizes the hero', async () => {
    expect(await signature({ file: 'dist/images/hero-640w.webp', length: 4, offset: 8 })).toBe('WEBP');
    expect(await signature({ file: 'dist/images/hero-1280w.avif', length: 4, offset: 8 })).toBe('avif');
    expect(await signature({ file: 'dist/images/hero-640w.jpg', length: 2 })).toBe('ÿØ');
    expect(await list('dist/images')).not.toContain('hero.jpg');
  });

  it('copies only the JPEG and PNG images into email/', async () => {
    const email = await list('dist/email');

    expect(email.length).toBeGreaterThan(0);
    expect(email.every((file) => /^images\/.+\.(?:jpg|png)$/.test(file))).toBe(true);
  });
});

describe('release', () => {
  it('revises the asset names, rewrites the references and writes a manifest', async () => {
    const manifest: Record<string, string> = JSON.parse(await text('release/site/rev-manifest.json'));
    const html = await text('release/site/index.html');
    const font = manifest['fonts/F563-Regular.woff2'] ?? '';

    expect(font).toMatch(/^fonts\/F563-Regular-\w{10}\.woff2$/);
    expect(manifest['images/hero-640w.avif']).toMatch(/^images\/hero-640w-\w{10}\.avif$/);

    expect(manifest['css/main.css']).toMatch(/^css\/main-\w{10}\.css$/);
    expect(html).toContain(`/${manifest['css/main.css']}`);
    expect(html).toContain(`/${manifest['js/app.js']}`);
    expect(html).toContain(`/${font}`);
    expect(html).toContain(`/${manifest['images/hero-640w.avif']} 640w`);
    expect(await text(`release/site/${manifest['css/main.css']}`)).toContain(font.replace('fonts/', ''));
    expect(await list('release/site')).toContain('robots.txt');
  });

  it('packs the revised site into a versioned zip', async () => {
    expect(await signature({ file: 'release/site-v1.0.0.zip', length: 4 })).toBe('PK\u0003\u0004');
  });
});
