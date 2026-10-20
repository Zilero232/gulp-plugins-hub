---
description: A gulp plugin that passes only the files changed since the last build, by modification time or contents, with extra dependencies such as Sass partials.
---

# file-changed

Lets through only the files that changed since the last build: the built file in the destination is missing, older or different. Put it right after `src` so a watch build skips the rest of the pipeline for untouched files.

```sh
npm install --save-dev @zilero/gulp-file-changed
```

## Usage

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

When the build renames files, tell the plugin where the built file is:

```js
fileChanged({ dest: 'dist/css', extname: '.css' }); // main.scss → dist/css/main.css
fileChanged({ dest: 'dist', target: ({ file }) => `images/${file.stem}-1280w.jpg` }); // any other name
fileChanged({ dest: 'dist', compare: 'contents' }); // for builds that copy files as they are
```

When every file depends on others the stream does not carry (Sass partials, a shared config), list them in `extra`: a file then also passes when the newest of them is newer than its built file.

```js
fileChanged({ dest: 'dist/css', extname: '.css', extra: ['src/scss/**/_*.scss', 'browserslist'] });
```

## Options

| Option    | Type                                                     | Default   | Description                                                                                                                                        |
| --------- | -------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dest`    | `string \| ({ file }) => string`                         | —         | The folder `dest` writes to, relative to `file.cwd` or absolute: the same value, or a function of the file. Required.                              |
| `extname` | `string`                                                 | —         | The extension the built file has, when the build changes it: `.css` for `.scss` sources. With its dot: `'css'` is an error.                        |
| `target`  | `({ file }) => string`                                   | —         | The built file's path, relative to `dest` or absolute, for builds that rename files in other ways. Wins over `extname`: `extname` is then ignored. |
| `extra`   | `string \| string[]`                                     | —         | Globs, relative to `file.cwd`, of files every file depends on. When the newest of them is newer than a file's built file, the file passes.         |
| `compare` | `'mtime' \| 'contents' \| ({ file, target }) => boolean` | `'mtime'` | How a file counts as changed. See below.                                                                                                           |

`dest` and `target` are called once per file and must return a string, not a promise. `target` gets one object with the Vinyl `file`; a relative path it returns is resolved against `dest`, and an absolute one is used as it is:

```js
import path from 'node:path';

fileChanged({ dest: 'dist', target: ({ file }) => `pages/${file.stem}/index.html` }); // dist/pages/about/index.html
fileChanged({ dest: 'dist', target: ({ file }) => path.resolve('cache', `${file.stem}.json`) }); // outside dest
```

`compare` can be:

| Value        | A file is changed when                                                                     |
| ------------ | ------------------------------------------------------------------------------------------ |
| `'mtime'`    | It is newer than the built file, in whole milliseconds.                                    |
| `'contents'` | Its bytes differ from the built file. Only for builds that copy files as they are.         |
| a function   | It returns `true` (or a promise of `true`); it gets the file and `target: { path, stat }`. |

`'contents'` fits only builds that write each file unchanged (copying static files, fonts, already optimized images). When the pipeline changes the file (compiles, minifies, adds a banner), the built file never has the source's bytes, so every file counts as changed on every run: use `'mtime'` there.

Unknown keys are an error. Options are checked when the plugin is created.

The package also exports the types `FileChangedOptions`, `CompareFunction`, `CompareInput`, `CompareMode`, `DestResolver` and `TargetResolver`.

## Notes

- Without `extname` or `target`, the built file is `dest` plus the path relative to `file.base`: `src/css/main.css` with `dest: 'dist'` is compared with `dist/css/main.css`.
- Files that were never built always pass, and so do directories. A `dest` (or `target`) that points at a file where a folder is expected counts as never built too.
- `extra` is checked after the built file is found and before `compare`: when the newest file the globs match is newer than the built file (in whole milliseconds), the file passes whatever `compare` says. Globs that match nothing are ignored. They are resolved once per stream (once per watch run, since gulp creates a new stream each time), relative to `file.cwd` (globs by [tinyglobby](https://github.com/SuperchupuDev/tinyglobby), dot-files included).
- `'mtime'` compares whole milliseconds: `dest` writes modification times with millisecond precision, so the sub-millisecond fraction a source keeps would otherwise make every file look newer than its built copy.
- With `'mtime'`, files without a `stat` always pass. With `'contents'`, files without buffered contents (`buffer: false`, `read: false`) always pass.
- Files that did not change are dropped; the others pass through untouched.
- Only a missing built file (or a file where a folder is expected) counts as never built. Any other error while checking it, such as a permission error, fails the task with a `PluginError`; so does an error thrown by a `dest`, `target` or `compare` function.
- Not for plugins that combine files (concat, archives): they need every file, not only the changed ones.

## Migrating

### From gulp-changed and gulp-newer

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

### From 1.x

file-changed is new in 2.0; there was no 1.x.
