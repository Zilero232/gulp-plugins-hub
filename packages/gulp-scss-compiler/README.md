# @zilero/gulp-scss-compiler

[![npm](https://img.shields.io/npm/v/@zilero/gulp-scss-compiler?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-scss-compiler)
[![license](https://img.shields.io/npm/l/@zilero/gulp-scss-compiler?color=7c3aed)](./LICENSE)

Compile SCSS and indented Sass with the modern Sass compiler (sass-embedded) in a gulp stream: one compiler process per stream, partials skipped, source maps kept.

```sh
npm install --save-dev @zilero/gulp-scss-compiler
```

```js
import { dest, src } from 'gulp';
import scssCompiler from '@zilero/gulp-scss-compiler';

export const styles = () =>
  src('src/styles/**/*.scss', { sourcemaps: true })
    .pipe(scssCompiler({ sassOptions: { style: 'compressed' } }))
    .pipe(dest('dist/css', { sourcemaps: '.' }));
```

| Option                              | Default | Description                                                     |
| ----------------------------------- | ------- | --------------------------------------------------------------- |
| `sassOptions`                       | `{}`    | Sass options: `style`, `loadPaths`, `importers`, `functions`, … |
| `skipPartials`                      | `true`  | Drop `_*.scss` and `_*.sass` files instead of compiling them.   |
| `onBeforeCompile`, `onAfterCompile` | —       | `({ content, file }) => string` hooks around Sass.              |

Errors point at the stylesheet where they happened, often a partial, and its line. Plain `.css` files pass through.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/scss-compiler)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { scssCompiler } = require(…)`.

MIT © Artemev Alexandr
