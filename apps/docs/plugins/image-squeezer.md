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
imageSqueezer({ quality: { webp: 75, avif: 50 }, encoderOptions: { png: { palette: true } } });
```

## Options

| Option           | Type                 | Default          | Description                                                                                                                                                                     |
| ---------------- | -------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formats`        | `Format \| Format[]` | `'original'`     | `'original'`, `'webp'`, `'avif'`, `'jpeg'` or `'png'`, or a list of them. `'original'` re-encodes in the source's own format. Each image becomes one file per format and width. |
| `widths`         | `number[]`           | keep the size    | Widths in pixels: `hero.jpg` becomes `hero-640w.jpg`, `hero-1280w.jpg`, … Images are never enlarged.                                                                            |
| `quality`        | `number \| object`   | encoder defaults | 1 to 100 for every lossy encoder, or per encoder: `{ jpeg, webp, avif, tiff }`. PNG and GIF ignore it.                                                                          |
| `encoderOptions` | `object`             | none             | sharp options per encoder (`jpeg`, `png`, `webp`, `avif`, `gif`, `tiff`), merged over the defaults and `quality`.                                                               |
| `keepSmaller`    | `boolean`            | `true`           | Keep the source when re-encoding it in its own format made it bigger.                                                                                                           |

Unknown keys, a quality outside 1–100 and empty `formats` or `widths` lists are an error when the plugin is created.

### Encoder defaults

Tuned for the web: visually lossless, and AVIF at a moderate effort because it encodes slowly.

| Encoder | Settings                            |
| ------- | ----------------------------------- |
| `jpeg`  | `quality: 80`, `mozjpeg: true`      |
| `png`   | `compressionLevel: 9`, `effort: 10` |
| `webp`  | `quality: 80`, `effort: 5`          |
| `avif`  | `quality: 55`, `effort: 4`          |
| `gif`   | `effort: 10`                        |
| `tiff`  | `quality: 80`                       |

`quality` overrides the default quality, and `encoderOptions` override both.

## Notes

- Files ending in `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`, `.tif` and `.tiff` (in any case) are processed. SVG, every other file and files without contents pass through untouched.
- Outputs are ordered by width, then by the order of `formats`. A converted file takes the format's extension (`.webp`, `.avif`, `.jpg`, `.png`); `'original'` keeps the source extension.
- A width larger than the image keeps the image's size, but the name still carries the width asked for: a 400 px image with `widths: [800]` becomes `photo-800w.png` at 400 px.
- `keepSmaller` applies only to `'original'` without `widths`: the source is emitted unchanged when the re-encoded file is not smaller. Converted and resized files are always the encoder's output.
- Photos are turned upright from the orientation stored in their metadata before resizing, so `widths` apply to the upright image.
- Asking for `'original'` and the source's own format (`formats: ['original', 'png']` on a `.png`) writes the file once, as `'original'`, with the source extension.
- Pages and frames are kept only between formats that can hold them:

  | Source               | Output              | Keeps               |
  | -------------------- | ------------------- | ------------------- |
  | animated GIF or WebP | GIF or WebP         | every frame         |
  | multi-page TIFF      | TIFF (`'original'`) | every page          |
  | anything else        | any other format    | the first page only |

- JPEG has no transparency: transparent pixels become white in JPEG output.
- An image read as UTF-8 text fails with an error that names the file and says to use `src(globs, { encoding: false })`.
- sharp ships prebuilt native binaries per platform as optional dependencies. An install that skips optional dependencies (`--no-optional`, `--omit=optional`) leaves them out and sharp fails to load.
