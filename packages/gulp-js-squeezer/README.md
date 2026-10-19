# @zilero/gulp-js-squeezer

[![npm](https://img.shields.io/npm/v/@zilero/gulp-js-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-js-squeezer)
[![license](https://img.shields.io/npm/l/@zilero/gulp-js-squeezer?color=7c3aed)](./LICENSE)

Minify JavaScript in a gulp stream with terser, keeping source maps.

```sh
npm install --save-dev @zilero/gulp-js-squeezer
```

```js
import { dest, src } from 'gulp';
import jsSqueezer from '@zilero/gulp-js-squeezer';

export const scripts = () =>
  src('src/js/**/*.js', { sourcemaps: true })
    .pipe(jsSqueezer({ terserOptions: { compress: { drop_console: true } } }))
    .pipe(dest('dist/js', { sourcemaps: '.' }));
```

| Option                            | Default | Description                                                                                          |
| --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `terserOptions`                   | `{}`    | terser options: `compress`, `mangle`, `format`, `module`, … Not `sourceMap`, which follows the file. |
| `onBeforeMinify`, `onAfterMinify` | —       | `({ content, file }) => string` hooks around terser.                                                 |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/js-squeezer)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { jsSqueezer } = require(…)`.

MIT © Artemev Alexandr
