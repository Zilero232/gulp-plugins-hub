---
description: Pack the files of a gulp stream into one reproducible zip, tar or tar.gz archive with archiver.
---

# archive-creator

Packs every file of the stream into one zip, tar or tar.gz archive with archiver and emits only the archive. Entries keep their paths relative to `file.base`, and their modification time and mode when the files came from disk. The archive is built in memory.

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
| `format`          | `'zip' \| 'tar' \| 'tgz'` | from `name` | Inferred from the extension of `name` (`.zip`, `.tar`, `.tgz`, `.tar.gz`), else zip. When both are given they must agree.             |
| `archiverOptions` | `ZipOptions & TarOptions` | —           | Passed to archiver: `zlib.level` or `store` for zip, `gzipOptions` for tgz. Must be an object (`Expected an object`).                 |
| `emptyArchive`    | `boolean`                 | `false`     | Emit an empty archive when the stream had no files. By default nothing is emitted.                                                    |
| `directories`     | `boolean`                 | `false`     | Add an entry for each directory in the stream (`src('**')` without `nodir`).                                                          |
| `modifiedTime`    | `Date`                    | —           | The modification time of every entry, for reproducible archives. Default: each file's `stat.mtime`, else 1980-01-01.                  |

All options are optional, and unknown keys are an error. `name` must stay inside the output folder: an absolute path or one that leaves it, such as `'../site.zip'`, is an error (`Expected a path inside the output folder`). So is a `format` that contradicts the extension of `name`: `{ name: 'a.zip', format: 'tar' }` throws `a.zip is a zip name, but format is tar: change one of them or drop format`. Options are checked when the plugin is created.

The package also exports the types `ArchiveCreatorOptions`, `ArchiveFormat` and `ArchiverOptions`.

## Notes

- Read files with `src(…, { encoding: false })`: gulp 5 reads files as UTF-8 by default, which breaks images, fonts and other binary files.
- The archive is placed relative to the `base` of the first file, so `dest('releases')` writes `releases/site.zip`.
- `format` is useful with a name without a known extension (`{ name: 'releases/site', format: 'tgz' }` writes `releases/site.tar.gz`); with a known extension it must agree with it. Extensions are matched case-insensitively.
- The archive is built in memory: every entry is compressed into a Buffer that is emitted at the end of the stream, so the archive must fit in memory. Streamed contents (`buffer: false`) are read entry by entry, but the result is still one Buffer.
- Files read with `buffer: false` are archived from their stream.
- Files without contents that are not directories (`read: false`, symbolic links) are skipped. Directories are skipped too unless `directories` is set. With `directories`, the base folder itself (`src('dist')` matches `dist` with an empty relative path) gets no entry, since it has no path inside the archive.
- An error while reading streamed contents, or an error from archiver, fails the task with a `PluginError` named after this plugin; it is reported on the next file or at the end of the stream, and the process does not crash. archiver's warnings (a missing file, for example) fail the archive the same way rather than being ignored. After a failure, archiver is aborted, so the remaining entries are not read.
- An empty stream emits nothing unless `emptyArchive` is set; the empty archive is then named relative to the current folder.

## Reproducible archives

The same files give the same archive on every build, byte for byte, as long as the dates are stable:

- files read from disk keep their `stat.mtime`, so they change the archive only when they change;
- files without a stat (made by other plugins, such as a concatenated bundle) get a fixed 1980-01-01, the earliest date zip can store, instead of the time of the build;
- `modifiedTime` gives every entry the same date, ignoring `stat.mtime`, for archives that depend only on the contents (CI builds from a fresh checkout, where every mtime is the checkout time).

zip stores dates in local time, so a zip is reproducible across machines in the same time zone; tar stores UTC.

```js
archiveCreator({ name: 'site.tar.gz', modifiedTime: new Date('2026-01-01T00:00:00Z') });
```

## Migrating

### From gulp-zip, gulp-tar and gulp-gzip

| gulp-zip, gulp-tar + gulp-gzip   | archive-creator                           |
| -------------------------------- | ----------------------------------------- |
| `zip('site.zip')`                | `archiveCreator({ name: 'site.zip' })`    |
| `zip(name, { compress: false })` | `archiverOptions: { store: true }`        |
| `zip(name, { modifiedTime })`    | `modifiedTime`                            |
| `zip(name, { buffer: false })`   | not needed: the archive is one Buffer     |
| `tar('site.tar')`, then `gzip()` | `archiveCreator({ name: 'site.tar.gz' })` |

### From 1.x

- Options are flat: `{ name, format, archiverOptions, emptyArchive, directories }` instead of `format`, `archiveOptions` and `pluginOptions: { archiveName, createDirectory, createEmptyArchive }`.
- `format` is no longer required: it is inferred from the extension of `name`.
- tar.gz (`tgz`) is supported.
- archiver 8 is used, streamed contents are supported and entries keep their modification time and mode.
- After 2.0.0: `modifiedTime` is new, files without a stat get a fixed date instead of the build time, and a `format` that contradicts the extension of `name` is an error (2.0.0 wrote a tar named `a.zip`).

See [migrating from 1.x](/guide/migration) for every package.
