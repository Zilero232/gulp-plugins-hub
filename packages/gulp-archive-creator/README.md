# @zilero/gulp-archive-creator

[![npm](https://img.shields.io/npm/v/@zilero/gulp-archive-creator?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-archive-creator)
[![license](https://img.shields.io/npm/l/@zilero/gulp-archive-creator?color=7c3aed)](./LICENSE)

Pack every file of a gulp stream into one zip, tar or tar.gz archive with archiver; entries keep their paths, modification time and mode.

```sh
npm install --save-dev @zilero/gulp-archive-creator
```

```js
import { dest, src } from 'gulp';
import archiveCreator from '@zilero/gulp-archive-creator';

export const release = () =>
  src('dist/**', { encoding: false })
    .pipe(archiveCreator({ name: 'site.zip' }))
    .pipe(dest('releases'));
```

| Option            | Default     | Description                                                                                        |
| ----------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `name`            | `'archive'` | Path inside the output folder (not absolute, no `..`); the format's extension is added if missing. |
| `format`          | from `name` | `'zip'`, `'tar'` or `'tgz'`; inferred from the extension, else zip.                                |
| `archiverOptions` | —           | Passed to archiver: `zlib.level` or `store` for zip, `gzipOptions` for tgz.                        |
| `emptyArchive`    | `false`     | Emit an empty archive when the stream had no files.                                                |
| `directories`     | `false`     | Add an entry for each directory in the stream.                                                     |

Files without contents that are not directories (`read: false`, symbolic links) are skipped. An error from streamed contents, or an error or warning from archiver, is emitted as a `PluginError` and aborts the archive.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/archive-creator)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { archiveCreator } = require(…)`.

MIT © Artemev Alexandr
