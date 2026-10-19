# @zilero/gulp-file-changed

[![npm](https://img.shields.io/npm/v/@zilero/gulp-file-changed?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-file-changed)
[![license](https://img.shields.io/npm/l/@zilero/gulp-file-changed?color=7c3aed)](./LICENSE)

Let through only the files that changed since the last build, so a watch build skips the rest of the pipeline for untouched files.

```sh
npm install --save-dev @zilero/gulp-file-changed
```

```js
import { dest, src } from 'gulp';
import fileChanged from '@zilero/gulp-file-changed';
import imageSqueezer from '@zilero/gulp-image-squeezer';

export const images = () =>
  src('src/images/**', { encoding: false })
    .pipe(fileChanged({ dest: 'dist/images' }))
    .pipe(imageSqueezer())
    .pipe(dest('dist/images'));
```

| Option    | Default   | Description                                                                                                                |
| --------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `dest`    | —         | The folder `dest` writes to, or a function of the file that returns it.                                                    |
| `extname` | —         | The built file's extension when the build changes it: `.css` for `.scss` sources.                                          |
| `target`  | —         | `({ file }) => path` of the built file, relative to `dest` or absolute, for builds that rename files. Wins over `extname`. |
| `compare` | `'mtime'` | `'mtime'` (newer than the built file), `'contents'` (different bytes) or a function.                                       |

A missing built file lets the file through; any other error while checking it, such as a permission error, fails the task.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/file-changed)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { fileChanged } = require(…)`.

MIT © Artemev Alexandr
