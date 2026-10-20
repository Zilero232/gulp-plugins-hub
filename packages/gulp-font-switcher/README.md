# @zilero/gulp-font-switcher

Convert fonts in a gulp stream to woff2, woff, ttf, eot or SVG and subset them to the glyphs you use, keeping every OpenType feature.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-font-switcher?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-font-switcher)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-font-switcher)](https://packagephobia.com/result?p=@zilero/gulp-font-switcher)
[![node](https://img.shields.io/node/v/@zilero/gulp-font-switcher?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-font-switcher?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/font-switcher)

Reads `ttf`, `otf`, `woff`, `woff2`, `eot` and SVG fonts and writes `woff2` (by default), `woff`, `ttf`, `eot` or `svg`, several at once. Subsetting is done by harfbuzz, so the kept glyphs keep their ligatures and kerning. All WebAssembly: nothing to compile on install.

Replaces `gulp-ttf2woff2`, `gulp-ttf2woff` and `gulp-fontmin`.

- woff2, woff and TrueType ttf are the same font in another container: every table kept.
- Subsetting with harfbuzz (`hb-subset`): characters as a string or as code points.
- Several formats from one source in one pass; `keepOriginal` to ship the source too.
- SVG images pass through: only SVG fonts (a `<font>` element) are converted.
- Two sources writing the same file (`Inter.ttf` and `Inter.otf` → `Inter.woff2`) are an error, not a silent overwrite.

## Install

```sh
npm install --save-dev @zilero/gulp-font-switcher
# pnpm add -D @zilero/gulp-font-switcher · bun add -d @zilero/gulp-font-switcher
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { fontSwitcher } from '@zilero/gulp-font-switcher';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const fonts = (): Promise<void> =>
  pipeline(
    src('src/fonts/*.{ttf,otf}', { encoding: false }), // fonts are binary
    fontSwitcher(), // Inter.ttf → Inter.woff2
    dest('dist/fonts')
  );
```

In CommonJS: `const { fontSwitcher } = require('@zilero/gulp-font-switcher')`.

## Options

| Option         | Type                         | Default     | Description                                                                                                                                                         |
| -------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formats`      | `FontFormat \| FontFormat[]` | `['woff2']` | `'woff2'`, `'woff'`, `'ttf'`, `'eot'` or `'svg'`, or a list of them. Each font becomes one file per format; a format listed twice is written once.                  |
| `subset`       | `string \| number[]`         | every glyph | Keep only these glyphs: the characters of a string, or Unicode code points (0 to `0x10FFFF`). The kept glyphs keep their OpenType features.                         |
| `hinting`      | `boolean`                    | `true`      | Keep the hinting instructions when subsetting and in the rebuilt formats (`ttf` from CFF, `eot`, `svg`). `woff2`, `woff` and TrueType `ttf` keep the font as it is. |
| `keepOriginal` | `boolean`                    | `false`     | Emit the source font as well as the converted ones.                                                                                                                 |

Options are validated when the plugin is created: unknown keys, `otf` as an output, an empty `formats` list, an empty `subset` and a code point out of range throw right away.

## Files and errors

- `.ttf`, `.otf`, `.woff`, `.woff2`, `.eot` and SVG fonts (`.svg` with a `<font>` element) are converted, extensions compared in lowercase. Other files, SVG images included, and files without contents pass through. Streamed contents emit an error.
- Outputs keep the name and folder and take the format's extension, in the order of `formats`. With `keepOriginal` the source comes first and is not converted to its own format again (unless it is subset).
- `ttf` from CFF outlines, `eot` and `svg` are rebuilt by fonteditor-core, without the OpenType layout tables; so are the outputs of `eot` and SVG-font inputs.
- Errors are PluginErrors from `@zilero/gulp-font-switcher` with `fileName` set: a font read as UTF-8 text (with the fix: `src(globs, { encoding: false })`), a broken font, an encoder that produced an empty file, and a second source that would write a file another one already wrote.

## Recipes

woff2 and woff for older browsers:

```ts
fontSwitcher({ formats: ['woff2', 'woff'] });
```

Latin subset only:

```ts
fontSwitcher({ subset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;!?-–—\'"()' });
```

A range of code points (Cyrillic):

```ts
fontSwitcher({ subset: Array.from({ length: 0x4ff - 0x400 + 1 }, (_, index) => 0x400 + index) });
```

## Migrating from `gulp-ttf2woff2` / `gulp-fontmin`

| gulp-ttf2woff2, gulp-ttf2woff, gulp-fontmin | @zilero/gulp-font-switcher             |
| ------------------------------------------- | -------------------------------------- |
| `ttf2woff2()`                               | `fontSwitcher()`                       |
| `ttf2woff()`                                | `fontSwitcher({ formats: 'woff' })`    |
| `ttf2woff2({ clone: true })`                | `fontSwitcher({ keepOriginal: true })` |
| `fontmin({ text: 'abc' })`                  | `fontSwitcher({ subset: 'abc' })`      |
| `fontmin({ hinting: false })`               | `fontSwitcher({ hinting: false })`     |
| fontmin `ttf2eot`, `ttf2svg` plugins        | `formats: ['eot', 'svg']`              |
| native or JS encoders that drop GSUB/GPOS   | woff2, woff and ttf keep every table   |

### From 1.x

- `{ pluginOptions: { format }, fontOptions: { glyph: { text } } }` became `{ formats, subset }`; `formats` takes several formats and defaults to `['woff2']`, `subset` takes code points too.
- fontmin was replaced by harfbuzz subsetting and fontverter: ligatures and kerning are kept, no native build.
- `hinting` (default `true`) and `keepOriginal` (default `false`) are top-level options; there is no `kerning` option, kerning is kept.
- `woff`, `woff2` and `eot` inputs are read; other files pass through instead of throwing.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- subset-font 2 (`^2.9.0`, harfbuzz), fontverter 2 (`^2.0.0`) and fonteditor-core 2 (`^2.6.3`), installed with the plugin

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/font-switcher)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
