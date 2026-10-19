# @zilero/gulp-folder-clone

[![npm](https://img.shields.io/npm/v/@zilero/gulp-folder-clone?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-folder-clone)
[![license](https://img.shields.io/npm/l/@zilero/gulp-folder-clone?color=7c3aed)](./LICENSE)

Copy every file of a gulp stream into one or more extra folders, relative to `file.base`, so a single `dest` writes them all.

```sh
npm install --save-dev @zilero/gulp-folder-clone
```

```js
import { dest, src } from 'gulp';
import folderClone from '@zilero/gulp-folder-clone';

// dist/images/logo.png, dist/backup/images/logo.png and dist/v2/images/logo.png
export const images = () =>
  src('src/images/**', { base: 'src', encoding: false })
    .pipe(folderClone({ dirs: ['backup', 'v2'] }))
    .pipe(dest('dist'));
```

| Option         | Default | Description                                                                                                   |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| `dirs`         | —       | One folder or a list inside `file.base` (not absolute, not `'.'`, no `..`) that receive a copy of every file. |
| `keepOriginal` | `true`  | Emit the original file as well as the copies.                                                                 |
| `onClone`      | —       | `({ file, dir, original })` for every copy: change it, return another file or `null` to skip it.              |

Copies are deep clones, each with its own source map whose `file` points at the copy.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/folder-clone)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { folderClone } = require(…)`.

MIT © Artemev Alexandr
