# archive-creator

Packs every file of the stream into one zip, tar or tar.gz archive with archiver and emits only the archive. Entries keep their paths relative to `file.base`, and their modification time and mode when the files came from disk.

```sh
npm install --save-dev @zilero/gulp-archive-creator
```

## Usage

```js
import { dest, src } from 'gulp';
import archiveCreator from '@zilero/gulp-archive-creator';

export const release = () =>
  src('dist/**', { encoding: false })
    .pipe(archiveCreator({ name: 'site.zip' }))
    .pipe(dest('releases'));
```

The format comes from the name, or from `format`:

```js
archiveCreator({ name: 'site.tar.gz' }); // tgz, from the extension
archiveCreator({ name: 'releases/site', format: 'tgz' }); // releases/site.tar.gz
archiveCreator({ name: 'site.zip', archiverOptions: { zlib: { level: 9 } } }); // passed to archiver
```

## Options

| Option            | Type                      | Default     | Description                                                                                                                           |
| ----------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                  | `'archive'` | The archive's path relative to the output folder: `site.zip`, `releases/site.tar.gz`. Without an extension the format's own is added. |
| `format`          | `'zip' \| 'tar' \| 'tgz'` | from `name` | Inferred from the extension of `name` (`.zip`, `.tar`, `.tgz`, `.tar.gz`), else zip.                                                  |
| `archiverOptions` | `ZipOptions & TarOptions` | —           | Passed to archiver: `zlib.level` or `store` for zip, `gzipOptions` for tgz. Must be an object (`Expected an object`).                 |
| `emptyArchive`    | `boolean`                 | `false`     | Emit an empty archive when the stream had no files. By default nothing is emitted.                                                    |
| `directories`     | `boolean`                 | `false`     | Add an entry for each directory in the stream (`src('**')` without `nodir`).                                                          |

All options are optional, and unknown keys are an error. `name` must stay inside the output folder: an absolute path or one that leaves it, such as `'../site.zip'`, is an error (`Expected a path inside the output folder`). Options are checked when the plugin is created.

The package also exports the types `ArchiveCreatorOptions`, `ArchiveFormat` and `ArchiverOptions`.

## Notes

- Read files with `src(…, { encoding: false })`: gulp 5 reads files as UTF-8 by default, which breaks images, fonts and other binary files.
- The archive is placed relative to the `base` of the first file, so `dest('releases')` writes `releases/site.zip`.
- An explicit `format` wins over the extension, and the name is then kept as it is: `{ name: 'a.zip', format: 'tar' }` writes a tar named `a.zip`. Extensions are matched case-insensitively.
- Files read with `buffer: false` are archived from their stream.
- Files without contents that are not directories (`read: false`, symbolic links) are skipped. Directories are skipped too unless `directories` is set. With `directories`, the base folder itself (`src('dist')` matches `dist` with an empty relative path) gets no entry, since it has no path inside the archive.
- An error while reading streamed contents, or an error from archiver, fails the task with a `PluginError` named after this plugin; it is reported on the next file or at the end of the stream, and the process does not crash. archiver's warnings (a missing file, for example) fail the archive the same way rather than being ignored. After a failure, archiver is aborted, so the remaining entries are not read.
- An empty stream emits nothing unless `emptyArchive` is set; the empty archive is then named relative to the current folder.

## Migrating from 1.x

- Options are flat: `{ name, format, archiverOptions, emptyArchive, directories }` instead of `format`, `archiveOptions` and `pluginOptions: { archiveName, createDirectory, createEmptyArchive }`.
- `format` is no longer required: it is inferred from the extension of `name`.
- tar.gz (`tgz`) is supported.
- archiver 8 is used, streamed contents are supported and entries keep their modification time and mode.

See [migrating from 1.x](/guide/migration) for every package.
