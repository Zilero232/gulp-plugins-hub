# @zilero/gulp-html-squeezer

[![npm](https://img.shields.io/npm/v/@zilero/gulp-html-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-html-squeezer)
[![license](https://img.shields.io/npm/l/@zilero/gulp-html-squeezer?color=7c3aed)](./LICENSE)

Minify HTML in a gulp stream with html-minifier-next: presets, inline CSS and JavaScript, hooks before and after.

```sh
npm install --save-dev @zilero/gulp-html-squeezer
```

```js
import { dest, src } from 'gulp';
import htmlSqueezer from '@zilero/gulp-html-squeezer';

export const html = () =>
  src('dist/**/*.html')
    .pipe(htmlSqueezer({ preset: 'comprehensive' }))
    .pipe(dest('dist'));
```

| Option                            | Default          | Description                                                                        |
| --------------------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `preset`                          | `'conservative'` | `'conservative'`, `'comprehensive'` (also inline CSS, JavaScript, SVG) or `false`. |
| `htmlMinifierOptions`             | —                | html-minifier-next options as an object, applied over the preset.                  |
| `onBeforeMinify`, `onAfterMinify` | —                | `({ content, file }) => string` hooks around the minifier.                         |

Only `.html` and `.htm` files are minified; other files, `.xhtml` included, pass through.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/html-squeezer)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { htmlSqueezer } = require(…)`.

MIT © Artemev Alexandr
