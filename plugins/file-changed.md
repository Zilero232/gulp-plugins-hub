---
url: /gulp-plugins-hub/plugins/file-changed.md
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

## Options

| Option    | Type                                                     | Default   | Description                                                                                                                                        |
| --------- | -------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dest`    | `string \| ({ file }) => string`                         | —         | The folder `dest` writes to, relative to `file.cwd` or absolute: the same value, or a function of the file. Required.                              |
| `extname` | `string`                                                 | —         | The extension the built file has, when the build changes it: `.css` for `.scss` sources. With its dot: `'css'` is an error.                        |
| `target`  | `({ file }) => string`                                   | —         | The built file's path, relative to `dest` or absolute, for builds that rename files in other ways. Wins over `extname`: `extname` is then ignored. |
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
| `'contents'` | Its bytes differ from the built file.                                                      |
| a function   | It returns `true` (or a promise of `true`); it gets the file and `target: { path, stat }`. |

Unknown keys are an error. Options are checked when the plugin is created.

The package also exports the types `FileChangedOptions`, `CompareFunction`, `CompareInput`, `CompareMode`, `DestResolver` and `TargetResolver`.

## Notes

* Without `extname` or `target`, the built file is `dest` plus the path relative to `file.base`: `src/css/main.css` with `dest: 'dist'` is compared with `dist/css/main.css`.
* Files that were never built always pass, and so do directories.
* `'mtime'` compares whole milliseconds: `dest` writes modification times with millisecond precision, so the sub-millisecond fraction a source keeps would otherwise make every file look newer than its built copy.
* With `'mtime'`, files without a `stat` always pass. With `'contents'`, files without buffered contents (`buffer: false`, `read: false`) always pass.
* Files that did not change are dropped; the others pass through untouched.
* Only a missing built file counts as never built. Any other error while checking it, such as a permission error, fails the task with a `PluginError`; so does an error thrown by a `dest`, `target` or `compare` function.
* Not for plugins that combine files (concat, archives): they need every file, not only the changed ones.
