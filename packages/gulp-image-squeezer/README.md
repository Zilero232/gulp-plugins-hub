# @zilero/gulp-image-squeezer

[![npm](https://img.shields.io/npm/v/@zilero/gulp-image-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-image-squeezer)
[![license](https://img.shields.io/npm/l/@zilero/gulp-image-squeezer?color=7c3aed)](./LICENSE)

Optimize images and convert them to WebP, AVIF, JPEG or PNG, at several widths for responsive images, with sharp in a gulp stream. Photos are turned upright from the orientation stored in their metadata; SVG and other files pass through.

```sh
npm install --save-dev @zilero/gulp-image-squeezer
```

```js
import { dest, src } from 'gulp';
import imageSqueezer from '@zilero/gulp-image-squeezer';

export const images = () =>
  src('src/images/**', { encoding: false }) // images are binary
    .pipe(imageSqueezer({ formats: ['original', 'webp', 'avif'], widths: [640, 1280] })) // hero-640w.webp, …
    .pipe(dest('dist/images'));
```

| Option           | Default          | Description                                                             |
| ---------------- | ---------------- | ----------------------------------------------------------------------- |
| `formats`        | `'original'`     | `'original'`, `'webp'`, `'avif'`, `'jpeg'`, `'png'`, or a list of them. |
| `widths`         | keep the size    | Widths in pixels; images are never enlarged.                            |
| `quality`        | encoder defaults | 1 to 100, or per encoder: `{ webp: 75, avif: 50 }`.                     |
| `encoderOptions` | none             | sharp options per encoder, over the defaults.                           |
| `keepSmaller`    | `true`           | Keep the source when re-encoding it in its own format made it bigger.   |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/image-squeezer)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { imageSqueezer } = require(…)`.

MIT © Artemev Alexandr
