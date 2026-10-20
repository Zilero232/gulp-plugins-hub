# @zilero/gulp-image-squeezer

Optimize images in a gulp stream with sharp and convert them to WebP, AVIF, JPEG or PNG, at several widths for responsive images.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-image-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-image-squeezer)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-image-squeezer)](https://packagephobia.com/result?p=@zilero/gulp-image-squeezer)
[![node](https://img.shields.io/node/v/@zilero/gulp-image-squeezer?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-image-squeezer?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/image-squeezer)

Optimizes `.jpg`, `.png`, `.webp`, `.avif`, `.gif` and `.tiff` images with [sharp](https://sharp.pixelplumbing.com), converts them to other formats and resizes them for `srcset`, one pass per image. SVG and every other file pass through.

Replaces `gulp-imagemin`, `gulp-webp`, `gulp-avif` and `gulp-sharp-responsive`.

- One library for every format: no per-format binaries that fail to download.
- Several formats and widths at once: `hero.jpg` → `hero-640w.webp`, `hero-640w.avif`, `hero-1280w.jpg`, …
- Web defaults: visually lossless JPEG, WebP and AVIF; PNG stays lossless.
- Photos turned upright from their EXIF orientation; animations and multi-page TIFFs kept where the format can hold them.
- Never bigger than the source when re-encoding in its own format, never enlarged.

## Install

```sh
npm install --save-dev @zilero/gulp-image-squeezer
# pnpm add -D @zilero/gulp-image-squeezer · bun add -d @zilero/gulp-image-squeezer
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { imageSqueezer } from '@zilero/gulp-image-squeezer';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const images = (): Promise<void> =>
  pipeline(
    src('src/images/**/*', { encoding: false }), // images are binary
    imageSqueezer({ formats: ['original', 'webp', 'avif'], widths: [640, 1280] }),
    dest('dist/images') // hero-640w.jpg, hero-640w.webp, hero-640w.avif, hero-1280w.jpg, …
  );
```

In CommonJS: `const { imageSqueezer } = require('@zilero/gulp-image-squeezer')`.

## Options

| Option           | Type                                                                  | Default          | Description                                                                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formats`        | `ImageFormat \| ImageFormat[]`                                        | `'original'`     | `'original'`, `'webp'`, `'avif'`, `'jpeg'`, `'png'`. Each image becomes one file per format and width. `'original'`, or the source's own format, re-encodes in that format and keeps the extension. |
| `widths`         | `number[]`                                                            | keep the size    | Widths in pixels: `hero.jpg` becomes `hero-640w.jpg`, `hero-1280w.jpg`, … Widths larger than the image become one file at the image's own width.                                                    |
| `quality`        | `number \| { jpeg?, webp?, avif?, tiff?, png? }`                      | encoder defaults | 1 to 100 for every lossy encoder, or per encoder. GIF ignores it; PNG takes it only with `encoderOptions.png.palette`.                                                                              |
| `encoderOptions` | `{ jpeg?: JpegOptions, png?: PngOptions, webp?, avif?, gif?, tiff? }` | none             | sharp's options per encoder, merged over the defaults and `quality`.                                                                                                                                |
| `keepSmaller`    | `boolean`                                                             | `true`           | Emit the source unchanged when re-encoding it in its own format, at its size, did not make it smaller.                                                                                              |

Options are validated when the plugin is created: unknown keys (in `encoderOptions` too), an encoder entry that is not an object, a quality outside 1–100 and empty `formats` or `widths` throw right away.

### Encoder defaults

| Encoder | Settings                                                    |
| ------- | ----------------------------------------------------------- |
| `jpeg`  | `quality: 80`, `mozjpeg: true`                              |
| `png`   | `compressionLevel: 9`, `adaptiveFiltering: true` (lossless) |
| `webp`  | `quality: 80`, `effort: 5`                                  |
| `avif`  | `quality: 55`, `effort: 4`                                  |
| `gif`   | `effort: 10`                                                |
| `tiff`  | `quality: 80`                                               |

`quality` overrides the default quality and `encoderOptions` override both. In sharp, PNG's `palette`, `quality`, `effort` and `colors` quantize the image to at most 256 colors: smaller files, but lossy, so it is opt-in.

## Files and errors

- `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, `.tif` and `.tiff` are processed, extensions compared in lowercase. SVG, other files and files without contents pass through untouched. Streamed contents emit an error.
- Outputs come by width, then in the order of `formats`. A converted file takes the format's extension (`.webp`, `.avif`, `.jpg`, `.png`).
- Images are never enlarged: on a 1000 px image, `widths: [640, 1280, 1920]` writes `-640w` and `-1000w`, so every name tells the real width.
- Animated GIF and WebP keep their frames between GIF and WebP, multi-page TIFFs their pages in TIFF; other outputs get the first frame. Transparent pixels become white in JPEG.
- An image read as UTF-8 text (gulp 5 without `encoding: false`) emits a PluginError that names the file and gives the fix. sharp's errors (a corrupt image) are PluginErrors from `@zilero/gulp-image-squeezer` with `fileName` set.

## Recipes

Modern formats next to the original, for `<picture>`:

```ts
imageSqueezer({ formats: ['original', 'webp', 'avif'] });
```

Responsive WebP only, a bit smaller:

```ts
imageSqueezer({ formats: 'webp', widths: [480, 960, 1920], quality: { webp: 70 } });
```

Palette PNG (like pngquant) for flat graphics:

```ts
imageSqueezer({ quality: { png: 80 }, encoderOptions: { png: { palette: true } } });
```

## Migrating from `gulp-imagemin`

| gulp-imagemin / gulp-sharp-responsive                | @zilero/gulp-image-squeezer                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `imagemin()` with the default plugins                | `imageSqueezer()`                                                    |
| `imagemin.mozjpeg({ quality: 75 })`                  | `quality: { jpeg: 75 }` (mozjpeg is on by default)                   |
| `imagemin.optipng()`                                 | the default: lossless PNG                                            |
| `imagemin-pngquant({ quality: [0.6, 0.8] })`         | `encoderOptions: { png: { palette: true } }`, `quality: { png: 80 }` |
| `imagemin.gifsicle()`                                | the default for `.gif`                                               |
| `imagemin.svgo()`                                    | not covered: SVG passes through                                      |
| `gulp-webp`, `gulp-avif`                             | `formats: 'webp'`, `formats: 'avif'`                                 |
| gulp-sharp-responsive `formats: [{ width, format }]` | `formats` × `widths`, names `<name>-<width>w.<ext>`                  |
| gulp-sharp-responsive `skipOnEnlargement`            | always: larger widths become one file at the image's width           |

The package is new in 2.0.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- sharp 0.35 (`^0.35.5`), installed with the plugin. sharp ships prebuilt binaries as optional dependencies: an install with `--omit=optional` leaves them out and sharp fails to load.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/image-squeezer)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
