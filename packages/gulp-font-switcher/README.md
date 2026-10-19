# @zilero/gulp-font-switcher

[![npm](https://img.shields.io/npm/v/@zilero/gulp-font-switcher?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-font-switcher)
[![license](https://img.shields.io/npm/l/@zilero/gulp-font-switcher?color=7c3aed)](./LICENSE)

Convert fonts (ttf, otf, woff, woff2, eot, SVG fonts) to woff2, woff, ttf, eot and svg in a gulp stream, into several formats at once, with optional glyph subsetting that keeps ligatures and kerning. All WebAssembly: no native build.

```sh
npm install --save-dev @zilero/gulp-font-switcher
```

```js
import { dest, src } from 'gulp';
import fontSwitcher from '@zilero/gulp-font-switcher';

export const fonts = () =>
  src('src/fonts/*.{ttf,otf}', { encoding: false }) // fonts are binary
    .pipe(fontSwitcher({ formats: ['woff2', 'woff'] })) // Inter.ttf → Inter.woff2, Inter.woff
    .pipe(dest('dist/fonts'));
```

| Option         | Default      | Description                                                                                 |
| -------------- | ------------ | ------------------------------------------------------------------------------------------- |
| `formats`      | _(required)_ | `'woff2'`, `'woff'`, `'ttf'`, `'eot'`, `'svg'`, or a list of them.                          |
| `subset`       | every glyph  | Keep only these glyphs: a string of characters or code points.                              |
| `hinting`      | `true`       | Keep the hinting instructions when subsetting and rebuilding.                               |
| `keepOriginal` | `false`      | Emit the source font as well, as it is (subset when its format is requested with `subset`). |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/font-switcher)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { fontSwitcher } = require(…)`.

MIT © Artemev Alexandr
