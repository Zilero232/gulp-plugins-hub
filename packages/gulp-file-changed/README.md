# @zilero/gulp-file-changed

Pass only the files that changed since the last build, by modification time or contents, so watch builds skip the rest.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-file-changed?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-file-changed)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-file-changed)](https://packagephobia.com/result?p=@zilero/gulp-file-changed)
[![node](https://img.shields.io/node/v/@zilero/gulp-file-changed?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-file-changed?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/file-changed)

Each file is compared with the file the build wrote for it last time: missing, older or different, it passes; otherwise it is dropped. Put it right after `src` so untouched files skip the rest of the pipeline. Replaces `gulp-changed` and `gulp-newer`.

- Finds the built file when the build renames it: a new extension (`.scss` → `.css`) or any path from a function.
- Compares modification times in whole milliseconds, so files `dest` just wrote do not look newer than their sources.
- `extra` globs (Sass partials, a config) count as a dependency of every file.
- `'contents'` mode for copy-as-is builds, or your own comparison.
- Typed options, validated when the plugin is created.

## Install

```sh
npm install --save-dev @zilero/gulp-file-changed
# pnpm add -D @zilero/gulp-file-changed · bun add -d @zilero/gulp-file-changed
```

gulp is not a dependency: the plugin works with the gulp your project already has.

## Usage

```ts
// gulpfile.ts
import { fileChanged } from '@zilero/gulp-file-changed';
import { imageSqueezer } from '@zilero/gulp-image-squeezer';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const images = (): Promise<void> =>
  pipeline(
    src('src/images/**', { encoding: false }),
    fileChanged({ dest: 'dist/images' }),
    imageSqueezer(),
    dest('dist/images')
  );
```

In CommonJS: `const { fileChanged } = require('@zilero/gulp-file-changed')`. The default export is the same function.

## Options

| Option    | Type                                                                                         | Default   | Description                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `dest`    | `string \| ({ file }) => string`                                                             | —         | Required. The folder `dest` writes to, relative to `file.cwd` or absolute: the same value you give `dest`, or a function of the file.      |
| `extname` | `string`                                                                                     | —         | The extension of the built file when the build changes it, with its dot: `'.css'` for `.scss` sources.                                     |
| `target`  | `({ file }) => string`                                                                       | —         | The built file's path, relative to `dest` or absolute, for builds that rename files in other ways. Wins over `extname`.                    |
| `extra`   | `string \| string[]`                                                                         | —         | Globs, relative to `file.cwd`, of files every file depends on. When the newest of them is newer than a file's built file, the file passes. |
| `compare` | `'mtime' \| 'contents' \| ({ file, target: { path, stat } }) => boolean \| Promise<boolean>` | `'mtime'` | How a file counts as changed: newer than the built file, different bytes, or your function returns `true`.                                 |

Options are validated when the plugin is created: unknown keys and an extension without its dot (`'css'`) are errors.

## How a file is checked

1. Directories pass.
2. The built file is `dest` + the path relative to `file.base` (with `extname` swapped in), or `target`'s path. If it does not exist, the file passes. A `dest` that points at a file instead of a folder counts as not built.
3. If the newest `extra` file is newer than the built file, the file passes.
4. Otherwise `compare` decides; an unchanged file is dropped.

`'mtime'` compares whole milliseconds; files without a `stat` always pass. `'contents'` compares bytes and only fits builds that copy files as they are: when the build changes the file (minifies, compiles), the built file never equals its source, so every file passes every time. Files without Buffer contents always pass with `'contents'`.

`dest`, `target` and `compare` get one object with the Vinyl `file`. `dest` and `target` must return a string, not a promise; `compare` may be async. The `extra` globs are resolved once per stream run, so each watch run sees the current files.

## Files and errors

- Every file is checked, whatever its type; files that pass are not changed.
- A missing built file lets the file through. Any other error while checking it, such as a permission error, fails the task with a `PluginError` from `@zilero/gulp-file-changed`, and so does an error thrown by `dest`, `target` or `compare`.
- Not for plugins that combine files (concat, archives): they need every file, not only the changed ones.

## Recipes

Sass, with partials as dependencies:

```ts
pipeline(
  src('src/scss/*.scss', { sourcemaps: true }),
  fileChanged({ dest: 'dist/css', extname: '.css', extra: 'src/scss/**/_*.scss' }),
  scssCompiler(),
  dest('dist/css', { sourcemaps: '.' })
);
```

Responsive images with a suffix:

```ts
fileChanged({ dest: 'dist', target: ({ file }) => `images/${file.stem}-1280w.jpg` });
```

Copy static files as they are, by contents:

```ts
pipeline(src('static/**', { encoding: false }), fileChanged({ dest: 'dist', compare: 'contents' }), dest('dist'));
```

## Migrating from gulp-changed and gulp-newer

| gulp-changed / gulp-newer                                        | file-changed                                 |
| ---------------------------------------------------------------- | -------------------------------------------- |
| `changed('dist')`, `newer('dist')`                               | `fileChanged({ dest: 'dist' })`              |
| `changed(dest, { extension: '.css' })`, `newer({ ext: '.css' })` | `extname: '.css'`                            |
| `transformPath`, `newer({ map })`                                | `target: ({ file }) => path`                 |
| `hasChanged: changed.compareContents`                            | `compare: 'contents'`                        |
| `hasChanged: changed.compareLastModifiedTime`                    | `compare: 'mtime'` (the default)             |
| a custom `hasChanged`                                            | `compare: ({ file, target }) => boolean`     |
| `newer({ extra })`                                               | `extra`                                      |
| `newer('dist/bundle.js')` (many sources, one file)               | not supported: run concat-like tasks in full |

New in 2.0: there was no 1.x of this package.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- No engine: built on `node:fs`

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/file-changed)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
