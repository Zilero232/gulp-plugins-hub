# @zilero/gulp-file-concat

[![npm](https://img.shields.io/npm/v/@zilero/gulp-file-concat?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-file-concat)
[![license](https://img.shields.io/npm/l/@zilero/gulp-file-concat?color=7c3aed)](./LICENSE)

Concatenate the files of a gulp stream into one, in an order you set with globs, with a separator, a header and a footer, and a source map that chains every input's own map.

```sh
npm install --save-dev @zilero/gulp-file-concat
```

```js
import { dest, src } from 'gulp';
import fileConcat from '@zilero/gulp-file-concat';

export const scripts = () =>
  src('src/js/**/*.js', { sourcemaps: true })
    .pipe(fileConcat({ name: 'bundle.js', order: ['vendor/**', '**'], separator: ';\n' }))
    .pipe(dest('dist/js', { sourcemaps: '.' }));
```

| Option      | Default      | Description                                                               |
| ----------- | ------------ | ------------------------------------------------------------------------- |
| `name`      | _(required)_ | The result's path, inside the output folder.                              |
| `order`     | stream order | A glob or a list: files matching the first come first, then the second, … |
| `separator` | `'\n'`       | Put between two files.                                                    |
| `header`    | none         | Added once at the start: a string or a function of the files.             |
| `footer`    | none         | Added once at the end: a string or a function of the files.               |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/file-concat)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { fileConcat } = require(…)`.

MIT © Artemev Alexandr
