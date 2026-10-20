---
description: Optimize JPEG, PNG, WebP, AVIF, GIF and TIFF images in a gulp stream with sharp, convert them to modern formats and resize them for srcset.
---

# image-squeezer

Optimizes JPEG, PNG, WebP, AVIF, GIF and TIFF images with [sharp](https://sharp.pixelplumbing.com), converts them to WebP, AVIF, JPEG or PNG and resizes them to several widths for `srcset`. Photos are turned upright from the orientation stored in their metadata. SVG and other files pass through.

```sh
npm install --save-dev @zilero/gulp-image-squeezer
```

## Usage

```js
import { dest, src } from 'gulp';
import imageSqueezer from '@zilero/gulp-image-squeezer';

export const images = () =>
  src('src/images/**', { encoding: false })
    .pipe(imageSqueezer({ formats: ['original', 'webp', 'avif'], widths: [640, 1280] }))
    // hero.jpg → hero-640w.jpg, hero-640w.webp, hero-640w.avif, hero-1280w.jpg, …
    .pipe(dest('dist/images'));
```

Images are binary: read them with `encoding: false`. Gulp 5 reads files as UTF-8 by default, which corrupts binary data.

Without options, every image is optimized in its own format and keeps its name:

```js
imageSqueezer();
imageSqueezer({ formats: 'webp', quality: 70 });
imageSqueezer({ quality: { webp: 75, avif: 50, png: 80 }, encoderOptions: { png: { palette: true } } });
```

## Options

| Option           | Type                                                                  | Default          | Description                                                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formats`        | `ImageFormat \| ImageFormat[]`                                        | `'original'`     | `'original'`, `'webp'`, `'avif'`, `'jpeg'` or `'png'`, or a list of them. `'original'`, or the source's own format, re-encodes in that format and keeps the extension. One file per format and width. |
| `widths`         | `number[]`                                                            | keep the size    | Widths in pixels: `hero.jpg` becomes `hero-640w.jpg`, `hero-1280w.jpg`, … Widths larger than the image become one file at the image's own width.                                                      |
| `quality`        | `number \| { jpeg?, webp?, avif?, tiff?, png? }`                      | encoder defaults | 1 to 100 for every lossy encoder, or per encoder. GIF ignores it; PNG takes it only with `encoderOptions.png.palette: true`.                                                                          |
| `encoderOptions` | `{ jpeg?: JpegOptions, png?: PngOptions, webp?, avif?, gif?, tiff? }` | none             | sharp's options per encoder, merged over the defaults and `quality`.                                                                                                                                  |
| `keepSmaller`    | `boolean`                                                             | `true`           | Keep the source when re-encoding it in its own format made it bigger.                                                                                                                                 |

Unknown keys (in `encoderOptions` too), an `encoderOptions` entry that is not an object, a quality outside 1–100 and empty `formats` or `widths` lists are an error when the plugin is created. `Quality` and `EncoderOptions` are exported types.

### Encoder defaults

Tuned for the web: visually lossless, AVIF at a moderate effort because it encodes slowly, and PNG lossless.

| Encoder | Settings                                         |
| ------- | ------------------------------------------------ |
| `jpeg`  | `quality: 80`, `mozjpeg: true`                   |
| `png`   | `compressionLevel: 9`, `adaptiveFiltering: true` |
| `webp`  | `quality: 80`, `effort: 5`                       |
| `avif`  | `quality: 55`, `effort: 4`                       |
| `gif`   | `effort: 10`                                     |
| `tiff`  | `quality: 80`                                    |

`quality` overrides the default quality, and `encoderOptions` override both.

### PNG palette

sharp quantizes a PNG to at most 256 colors when any of `palette`, `quality`, `effort` or `colors` is set. That is lossy, so the default PNG settings use none of them and a re-encoded PNG decodes to the same pixels. Opt in for flat graphics, where it saves the most:

```js
imageSqueezer({ quality: { png: 80 }, encoderOptions: { png: { palette: true, effort: 10 } } });
```

`quality` reaches the PNG encoder only with `palette: true`, so `quality: 70` for every encoder leaves PNG lossless.

## Notes

- Files ending in `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, `.tif` and `.tiff` (in any case) are processed. SVG, every other file and files without contents pass through untouched.
- Outputs are ordered by width, then by the order of `formats`. A converted file takes the format's extension (`.webp`, `.avif`, `.jpg`, `.png`); `'original'` keeps the source extension.
- Images are never enlarged, and names tell the real width: widths larger than the image become one file at the image's own width. A 1000 px image with `widths: [640, 1280, 1920]` becomes `photo-640w.png` and `photo-1000w.png`. The width is the upright one, after the EXIF orientation is applied.
- `keepSmaller` applies only to `'original'` without `widths`: the source is emitted unchanged when the re-encoded file is not smaller. Converted and resized files are always the encoder's output.
- Photos are turned upright from the orientation stored in their metadata before resizing, so `widths` apply to the upright image.
- The source's own format is the same as `'original'`: `formats: 'jpeg'` on `photo.jpeg` keeps `photo.jpeg` (no rename to `.jpg`) and applies `keepSmaller`, and `formats: ['original', 'png']` on a `.png` writes the file once.
- Pages and frames are kept only between formats that can hold them:

  | Source               | Output              | Keeps               |
  | -------------------- | ------------------- | ------------------- |
  | animated GIF or WebP | GIF or WebP         | every frame         |
  | multi-page TIFF      | TIFF (`'original'`) | every page          |
  | anything else        | any other format    | the first page only |

- JPEG has no transparency: transparent pixels become white in JPEG output.
- An image read as UTF-8 text fails with an error that names the file and says to use `src(globs, { encoding: false })`.
- sharp ships prebuilt native binaries per platform as optional dependencies. An install that skips optional dependencies (`--no-optional`, `--omit=optional`) leaves them out and sharp fails to load.

## Migrating

### From gulp-imagemin

| gulp-imagemin, gulp-webp, gulp-sharp-responsive      | image-squeezer                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `imagemin()` with the default plugins                | `imageSqueezer()`                                                       |
| `imagemin.mozjpeg({ quality: 75 })`                  | `quality: { jpeg: 75 }` (mozjpeg is on by default)                      |
| `imagemin.optipng()`                                 | the default: lossless PNG                                               |
| `imagemin-pngquant({ quality: [0.6, 0.8] })`         | `encoderOptions: { png: { palette: true } }` and `quality: { png: 80 }` |
| `imagemin.gifsicle()`                                | the default for `.gif`                                                  |
| `imagemin.svgo()`                                    | not covered: SVG passes through                                         |
| `gulp-webp`, `gulp-avif`                             | `formats: 'webp'`, `formats: 'avif'`                                    |
| gulp-sharp-responsive `formats: [{ width, format }]` | `formats` × `widths`, named `<name>-<width>w.<ext>`                     |
| gulp-sharp-responsive `skipOnEnlargement`            | always: larger widths become one file at the image's width              |

### From 1.x

There was no 1.x: image-squeezer is new in 2.0. After 2.0.0, PNG defaults are lossless (2.0.0 quantized PNGs to a palette through `effort: 10`), widths larger than the image no longer write files named after a width they do not have, and the source's own format counts as `'original'`.
