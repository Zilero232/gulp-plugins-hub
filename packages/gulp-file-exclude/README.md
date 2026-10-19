# @zilero/gulp-file-exclude

[![npm](https://img.shields.io/npm/v/@zilero/gulp-file-exclude?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-file-exclude)
[![license](https://img.shields.io/npm/l/@zilero/gulp-file-exclude?color=7c3aed)](./LICENSE)

Drop files from a gulp stream by glob, regular expression, size range or your own check; every other file passes through untouched.

```sh
npm install --save-dev @zilero/gulp-file-exclude
```

```js
import { dest, src } from 'gulp';
import fileExclude from '@zilero/gulp-file-exclude';

export const copy = () =>
  src('src/**', { encoding: false })
    .pipe(fileExclude({ patterns: ['*.map', 'drafts/**'], size: { max: 1024 * 1024 } }))
    .pipe(dest('dist'));
```

| Option               | Example                                                             | Drops                                    |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| a glob               | `fileExclude({ patterns: '*.map' })`                                | every `.map` file, in any folder         |
| a path glob          | `fileExclude({ patterns: 'drafts/**' })`                            | everything under `drafts/`               |
| a regular expression | `fileExclude({ patterns: /\.psd$/ })`                               | paths relative to `file.base` that match |
| `size`               | `fileExclude({ size: { min: 1, max: 1e6 } })`                       | empty files and files over 1 MB          |
| `exclude`            | `fileExclude({ exclude: ({ file }) => file.stem.startsWith('_') })` | files the function returns `true` for    |

Globs are relative to `file.base` and use `/`. Negated globs (`'!*.css'`) are rejected, since every pattern here means "drop", not "keep" as in gulp-filter; so are globs with `\` and absolute globs. Invalid options throw when the plugin is created.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/file-exclude)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { fileExclude } = require(…)`.

MIT © Artemev Alexandr
