# @zilero/gulp-pug-compiler

[![npm](https://img.shields.io/npm/v/@zilero/gulp-pug-compiler?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-pug-compiler)
[![license](https://img.shields.io/npm/l/@zilero/gulp-pug-compiler?color=7c3aed)](./LICENSE)

Compile Pug templates to HTML in a gulp stream, with per-file data, includes from the file contents and your own extension.

```sh
npm install --save-dev @zilero/gulp-pug-compiler
```

```js
import { dest, src } from 'gulp';
import pugCompiler from '@zilero/gulp-pug-compiler';

export const pages = () =>
  src('src/**/*.pug')
    .pipe(pugCompiler({ data: ({ file }) => ({ page: file.stem }), pugOptions: { pretty: true } }))
    .pipe(dest('dist'));
```

| Option            | Default   | Description                                                              |
| ----------------- | --------- | ------------------------------------------------------------------------ |
| `pugOptions`      | —         | pug options object: `pretty`, `doctype`, `filters`, `basedir`, …         |
| `data`            | —         | Locals as an object, or a function of the file that returns them.        |
| `extname`         | `'.html'` | The extension of the output.                                             |
| `skipPartials`    | `true`    | Drop `_*.pug` files instead of rendering them.                           |
| `onBeforeCompile` | —         | `({ content, file }) => string` hook on the template source, before pug. |
| `onAfterCompile`  | —         | `({ content, file }) => string` hook on the rendered HTML.               |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/pug-compiler)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { pugCompiler } = require(…)`.

MIT © Artemev Alexandr
