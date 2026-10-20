---
url: /gulp-plugins-hub/plugins/font-switcher.md
description: >-
  Convert fonts in a gulp stream to woff2, woff, ttf, eot or SVG and subset them
  with harfbuzz, keeping ligatures, kerning and every OpenType feature.
---

# font-switcher

Converts fonts from `ttf`, `otf`, `woff`, `woff2`, `eot` and SVG fonts into `woff2`, `woff`, `ttf`, `eot` and `svg`, into one format or several at once, and can keep only the glyphs you use. Subsetting is done by [subset-font](https://github.com/papandreou/subset-font) (hb-subset) and keeps ligatures, kerning and the other OpenType features. All WebAssembly: there is no native build to install.

```sh
npm install --save-dev @zilero/gulp-font-switcher
```

## Usage

```js
import { dest, src } from 'gulp';
import fontSwitcher from '@zilero/gulp-font-switcher';

export const fonts = () =>
  src('src/fonts/*.{ttf,otf}', { encoding: false })
    .pipe(fontSwitcher({ formats: ['woff2', 'woff'] })) // Inter.ttf → Inter.woff2, Inter.woff; fontSwitcher() writes woff2
    .pipe(dest('dist/fonts'));
```

Fonts are binary: read them with `encoding: false`. Gulp 5 reads files as UTF-8 by default, which corrupts binary data.

To ship only the characters a site uses, pass them as `subset`:

```js
fontSwitcher({ formats: 'woff2', subset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?' });
fontSwitcher({ formats: 'woff2', subset: [0x20, 0x41, 0x42, 0x2014] }); // Unicode code points
```

## Options

| Option         | Type                         | Default     | Description                                                                                                                                                                                                  |
| -------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `formats`      | `FontFormat \| FontFormat[]` | `['woff2']` | `'woff2'`, `'woff'`, `'ttf'`, `'eot'` or `'svg'`, or a list of them. Each font becomes one file per format.                                                                                                  |
| `subset`       | `string \| number[]`         | every glyph | Keep only these glyphs: the characters of a string, or Unicode code points. The kept glyphs keep their OpenType features.                                                                                    |
| `hinting`      | `boolean`                    | `true`      | Keep the hinting instructions (sharper text on low-resolution screens) when subsetting and in the rebuilt formats (`ttf` from CFF, `eot`, `svg`). `woff2`, `woff` and TrueType `ttf` keep the font as it is. |
| `keepOriginal` | `boolean`                    | `false`     | Emit the source font as well as the converted ones.                                                                                                                                                          |

`otf` is read but not written. Unknown keys, an empty `formats` list, an empty `subset` string and an empty list of code points are an error when the plugin is created. So is a code point that is not an integer from 0 to U+10FFFF (`0x10FFFF`), such as `0x110000` (`Expected a Unicode code point`). A format listed twice is written once.

## Output formats

| Output                 | Made by                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `woff2`, `woff`        | The same font in another container, every table kept ([container converter](https://github.com/papandreou/fontverter)).                               |
| `ttf` from TrueType    | The font as it is, every table kept.                                                                                                                  |
| `ttf` from CFF (`otf`) | Rebuilt by [fonteditor-core](https://github.com/kekee000/fonteditor-core), which turns the outlines into TrueType without the OpenType layout tables. |
| `eot`, `svg`           | Rebuilt by fonteditor-core, without the OpenType layout tables (ligatures, kerning).                                                                  |

`eot` and SVG-font inputs are read through fonteditor-core, which rebuilds them from their glyphs as TrueType, so their outputs have no OpenType layout tables either. `ttf`, `otf`, `woff` and `woff2` inputs are unpacked as they are.

## Notes

* Files ending in `.ttf`, `.otf`, `.woff`, `.woff2` and `.eot` (in any case) are converted, and `.svg` files that are SVG fonts (a `<font>` element inside). Every other file passes through untouched, SVG images included, and so do files without contents. An SVG with only a `<font-face>` element and no `<font>` is not a font and passes through.
* The output keeps the name and folder and takes the format's extension: `fonts/Inter.ttf` becomes `fonts/Inter.woff2`. Outputs follow the order of `formats`; with `keepOriginal`, the source comes first and is not converted to its own format again, so `keepOriginal` with `formats: ['ttf', 'woff2']` on a `.ttf` emits the source and a woff2.
* With `keepOriginal` and `subset`, a requested format equal to the source's is subset and takes the source's path: `keepOriginal` with `formats: ['ttf', 'woff2']` and a `subset` on a `.ttf` emits a subset ttf and a subset woff2, not the full source as well. When the source's format is not requested, the source is emitted as it is, not subset.
* `hinting: false` drops the hinting instructions when subsetting and in the rebuilt formats (`ttf` from CFF, `eot`, `svg`); without `subset`, `woff2`, `woff` and TrueType `ttf` outputs keep the font, hinting included.
* A binary font read as UTF-8 text fails with an error that names the file and says to use `src(globs, { encoding: false })`.
* An encoder that produces an empty file is an error, never an empty output.
* A broken font emits a PluginError with the file name.
* Two sources that would write the same file fail the stream with a PluginError naming both: `Inter.ttf` and `Inter.otf` both become `Inter.woff2`, and a kept `Inter.woff2` would collide with the one converted from `Inter.ttf`. Without the error, the second file would silently replace the first in the output folder. Keep one source per family and style, or convert them in separate tasks into separate folders.

## Migrating

### From gulp-ttf2woff2 or gulp-fontmin

| gulp-ttf2woff2, gulp-ttf2woff, gulp-fontmin | font-switcher                          |
| ------------------------------------------- | -------------------------------------- |
| `ttf2woff2()`                               | `fontSwitcher()`                       |
| `ttf2woff()`                                | `fontSwitcher({ formats: 'woff' })`    |
| `ttf2woff2({ clone: true })`                | `fontSwitcher({ keepOriginal: true })` |
| `fontmin({ text: 'abc' })`                  | `fontSwitcher({ subset: 'abc' })`      |
| `fontmin({ hinting: false })`               | `fontSwitcher({ hinting: false })`     |
| fontmin's `ttf2eot`, `ttf2svg` plugins      | `formats: ['eot', 'svg']`              |

### From 1.x

* fontmin and fonteditor-core's lossy writing were replaced: subsetting by subset-font and container conversion keep every table of the font, ligatures and kerning included. Conversion is all WebAssembly, with no native dependencies.
* `{ pluginOptions: { format }, fontOptions: { glyph } }` becomes flat options: `format` is now `formats`, which takes one format or several and defaults to `['woff2']`, and `glyph.text` is now `subset`, which also takes code points.
* `hinting` is a top-level option, `true` by default. There is no `kerning` option: kerning is always kept in `woff2`, `woff` and TrueType `ttf` outputs.
* `keepOriginal` (default `false`) is new.
* `woff`, `woff2` and `eot` fonts are read too, not only `ttf`, `otf` and `svg`.
* Other files pass through instead of throwing an error.

```js
// 1.x
fontSwitcher({ pluginOptions: { format: 'woff2' }, fontOptions: { glyph: { text: 'abc' } } });
// 2.0
fontSwitcher({ formats: 'woff2', subset: 'abc' });
```

See [migrating from 1.x](/guide/migration) for every package.
