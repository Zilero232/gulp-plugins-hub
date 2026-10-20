# @zilero/gulp-archive-creator

Pack the files of a gulp stream into one zip, tar or tar.gz archive.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-archive-creator?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-archive-creator)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-archive-creator)](https://packagephobia.com/result?p=@zilero/gulp-archive-creator)
[![node](https://img.shields.io/node/v/@zilero/gulp-archive-creator?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-archive-creator?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/archive-creator)

Packs every file of the stream into one archive with [archiver](https://www.archiverjs.com) and emits only the archive. Entries keep their paths relative to `file.base`.

Replaces `gulp-zip`, and `gulp-tar` + `gulp-gzip`.

- zip, tar and tar.gz from one plugin; the format comes from the name.
- Reproducible archives: a fixed date for files without a stat, or `modifiedTime` for every entry.
- Streamed contents (`buffer: false`) archived as they come.
- Optional directory entries and empty archives.
- Read errors and archiver warnings fail the task with a PluginError, never a crash.

## Install

```sh
npm install --save-dev @zilero/gulp-archive-creator
# pnpm add -D @zilero/gulp-archive-creator · bun add -d @zilero/gulp-archive-creator
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { archiveCreator } from '@zilero/gulp-archive-creator';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const release = (): Promise<void> =>
  pipeline(
    src('dist/**/*', { encoding: false }), // keeps images and fonts intact
    archiveCreator({ name: 'site.zip' }),
    dest('releases') // releases/site.zip
  );
```

In CommonJS: `const { archiveCreator } = require('@zilero/gulp-archive-creator')`.

## Options

| Option            | Type                      | Default     | Description                                                                                                                           |
| ----------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                  | `'archive'` | The archive's path relative to the output folder: `site.zip`, `releases/site.tar.gz`. Without an extension the format's own is added. |
| `format`          | `'zip' \| 'tar' \| 'tgz'` | from `name` | From the extension of `name` (`.zip`, `.tar`, `.tgz`, `.tar.gz`, any case), else zip. Must match the extension when both are given.   |
| `archiverOptions` | `ZipOptions & TarOptions` | —           | Passed to archiver: `zlib.level` or `store` for zip, `gzipOptions` for tgz.                                                           |
| `emptyArchive`    | `boolean`                 | `false`     | Emit an empty archive when the stream had no files. By default nothing is emitted.                                                    |
| `directories`     | `boolean`                 | `false`     | Add an entry for each directory in the stream (`src('**')` without `nodir`).                                                          |
| `modifiedTime`    | `Date`                    | —           | The modification time of every entry. Default: each file's `stat.mtime`, and 1980-01-01 for files without a stat.                     |

Options are validated when the plugin is created: unknown keys, a `name` outside the output folder (`/tmp/a.zip`, `../a.zip`), a `format` that contradicts the name (`{ name: 'a.zip', format: 'tar' }`) and a `modifiedTime` that is not a `Date` throw right away.

## Files and errors

- Every file with contents becomes an entry, in stream order; streamed contents are read into the archive. Files without contents (`read: false`, symbolic links) are skipped, directories too unless `directories` is set.
- The archive is built in memory and emitted at the end of the stream, placed relative to the `base` of the first file. Archives larger than the memory you can spare need a streaming tool instead.
- Entries keep the mode of files from disk. Their date is `modifiedTime`, else `stat.mtime`, else a fixed 1980-01-01, so files made by other plugins do not change the archive from one build to the next. zip stores dates in local time.
- A failing stream or an archiver warning emits a PluginError from `@zilero/gulp-archive-creator`; the remaining entries are not read.

## Recipes

Maximum zip compression:

```ts
archiveCreator({ name: 'site.zip', archiverOptions: { zlib: { level: 9 } } });
```

A byte-for-byte reproducible tarball:

```ts
archiveCreator({ name: 'site.tar.gz', modifiedTime: new Date('2026-01-01T00:00:00Z') });
```

A versioned name:

```ts
archiveCreator({ name: `releases/site-${process.env.npm_package_version}.zip` });
```

## Migrating from `gulp-zip`

| gulp-zip, gulp-tar + gulp-gzip   | @zilero/gulp-archive-creator              |
| -------------------------------- | ----------------------------------------- |
| `zip('site.zip')`                | `archiveCreator({ name: 'site.zip' })`    |
| `zip(name, { compress: false })` | `archiverOptions: { store: true }`        |
| `zip(name, { modifiedTime })`    | `modifiedTime`                            |
| `zip(name, { buffer: false })`   | not needed: the archive is one Buffer     |
| `tar('site.tar')`, then `gzip()` | `archiveCreator({ name: 'site.tar.gz' })` |

### From 1.x

- Options are flat: `{ name, format, archiverOptions, emptyArchive, directories, modifiedTime }` instead of `format`, `archiveOptions` and `pluginOptions: { archiveName, createDirectory, createEmptyArchive }`.
- `format` is inferred from the extension of `name`; tar.gz is supported.
- archiver 8: streamed contents work, and entries keep their modification time and mode.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- archiver 8 (`^8.0.0`), installed with the plugin

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/archive-creator)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
