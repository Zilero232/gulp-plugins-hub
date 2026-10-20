# @zilero/gulp-folder-clone

Copy every file of a gulp stream into one or more extra folders in a single pass, with an optional hook to change each copy.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-folder-clone?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-folder-clone)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-folder-clone)](https://packagephobia.com/result?p=@zilero/gulp-folder-clone)
[![node](https://img.shields.io/node/v/@zilero/gulp-folder-clone?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-folder-clone?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/folder-clone)

Each file is copied to `base/<dir>/<relative path>` for every folder in `dirs`, so one `dest` writes the original and all its copies. Replaces `gulp-clone` (and the extra `dest` calls that go with it).

- One plugin, one pass: no second stream to merge, no repeated `dest`.
- Deep copies: each copy has its own contents and its own source map, pointing at the copy.
- `onClone` changes, replaces or skips each copy, sync or async; maps follow a copy it renames.
- Folders are checked up front: outside the base, the base itself and duplicates are errors.
- Typed options, validated when the plugin is created.

## Install

```sh
npm install --save-dev @zilero/gulp-folder-clone
# pnpm add -D @zilero/gulp-folder-clone · bun add -d @zilero/gulp-folder-clone
```

gulp is not a dependency: the plugin works with the gulp your project already has.

## Usage

```ts
// gulpfile.ts
import { folderClone } from '@zilero/gulp-folder-clone';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

// dist/images/logo.png, dist/backup/images/logo.png and dist/v2/images/logo.png
export const images = (): Promise<void> =>
  pipeline(
    src('src/images/**', { base: 'src', encoding: false }),
    folderClone({ dirs: ['backup', 'v2'] }),
    dest('dist')
  );
```

In CommonJS: `const { folderClone } = require('@zilero/gulp-folder-clone')`. The default export is the same function.

## Options

| Option         | Type                                                                                   | Default | Description                                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `dirs`         | `string \| string[]`                                                                   | —       | Required. Folders relative to `file.base` that receive a copy of every file. Not absolute, not `'.'`, no `..`, each listed only once. |
| `keepOriginal` | `boolean`                                                                              | `true`  | Emit the original file as well as the copies.                                                                                         |
| `onClone`      | `({ file, dir, original }) => Vinyl \| null \| void \| Promise<Vinyl \| null \| void>` | —       | Runs for every copy: change it in place, return another file to emit instead, or `null` to skip it.                                   |

Options are validated when the plugin is created: an invalid one throws a `PluginError` that lists every problem (`Expected a folder inside file.base…`, `Add at least one folder`, `Each folder may be listed only once`, unknown keys).

## Hooks

`onClone` runs once per file and folder, after the copy is made and moved into its folder, in the order of `dirs`. It gets:

| Key        | Description                                             |
| ---------- | ------------------------------------------------------- |
| `file`     | The copy, already moved into `dir`; change it in place. |
| `dir`      | The folder this copy goes to, as given in `dirs`.       |
| `original` | The file the copy was made from; leave it as it is.     |

Return nothing to keep the copy, `null` to skip it, or another Vinyl file to emit instead. The hook may be async. After it, the source map's `file` is set to the emitted file's path, so a copy renamed in the hook (`file.stem = …`) gets its map under the new name.

```ts
folderClone({
  dirs: ['legacy', 'drafts'],
  onClone: ({ file, dir }) => {
    if (dir === 'drafts') {
      return null; // skip this copy
    }

    file.stem = `${file.stem}-${dir}`; // legacy/js/app-legacy.js
  }
});
```

## Source maps

With `src(…, { sourcemaps: true })`, every copy has a map of its own whose `file` is the copy's relative path; the original's map is not touched. `dest(…, { sourcemaps: '.' })` writes one map per file.

## Files and errors

- Every file is cloned, whatever its contents: text, binary, files without contents (`read: false`) and directories.
- For each file the original comes first, then one copy per folder in the order of `dirs`. With `keepOriginal: false` and every copy skipped, nothing is emitted for that file.
- Read images and other binary files with `src(…, { encoding: false })`: gulp 5 reads files as UTF-8 by default.
- An error thrown by `onClone` is emitted as a `PluginError` from `@zilero/gulp-folder-clone`, with the file's path.

## Recipes

Mirror the build into `dist/latest`:

```ts
pipeline(src('dist/**', { encoding: false }), folderClone({ dirs: 'latest' }), dest('dist'));
```

Publish the build into two releases, without the original:

```ts
folderClone({ dirs: ['releases/stable', 'releases/next'], keepOriginal: false });
```

Copy only some files into a folder:

```ts
folderClone({
  dirs: 'public',
  onClone: ({ file }) => (file.extname === '.map' ? null : undefined)
});
```

## Migrating from gulp-clone

| gulp-clone                                                      | folder-clone                           |
| --------------------------------------------------------------- | -------------------------------------- |
| `clone()` / `clone.sink()`, a second branch with its own `dest` | `folderClone({ dirs })` and one `dest` |
| change the cloned files in the second branch                    | `onClone({ file, dir, original })`     |
| drop the originals by not writing the first branch              | `keepOriginal: false`                  |

### From 1.x

- 1.x only had an `onBeforeCopy(file)` hook and passed files through unchanged. 2.0 copies each file into the folders in `dirs`.
- `onBeforeCopy` is replaced by `onClone({ file, dir, original })`, which can change, replace or skip (`null`) each copy.
- `keepOriginal` (default `true`) is new.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- No engine: built on vinyl's own `clone()`

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/folder-clone)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
