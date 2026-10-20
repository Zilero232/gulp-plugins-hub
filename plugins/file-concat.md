---
url: /gulp-plugins-hub/plugins/file-concat.md
description: >-
  Concatenate the files of a gulp stream into one, in an order set with globs,
  with a header, a footer and a source map chained through every input.
---

# file-concat

Joins every file of the stream into one, with a separator between files, an optional header and footer, and an order you set with globs. When any input has a source map, the result gets one that chains every input's own map, so it points at the original sources.

```sh
npm install --save-dev @zilero/gulp-file-concat
```

## Usage

```js
import { dest, src } from 'gulp';
import fileConcat from '@zilero/gulp-file-concat';

export const scripts = () =>
  src('src/js/**/*.js', { sourcemaps: true })
    .pipe(
      fileConcat({
        name: 'bundle.js',
        order: ['vendor/**', '**'], // vendor files first, then the rest
        separator: ';\n',
        header: '/*! My site */\n'
      })
    )
    .pipe(dest('dist/js', { sourcemaps: '.' }));
```

The header and footer can be functions of the concatenated files, sync or async:

```js
fileConcat({ name: 'app.css', header: ({ files }) => `/* ${files.length} files */\n` });
```

## Options

| Option      | Type                 | Default      | Description                                                                                                                                                     |
| ----------- | -------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | `string`             | *(required)* | The result's path relative to the output folder: `app.js`, `vendor/bundle.css`. Must stay inside the output folder (not absolute, no leading `..`).             |
| `order`     | `string \| string[]` | stream order | One glob or several, matched against the path relative to each file's `file.base`: files matching the first glob come first, then the second, …, then the rest. |
| `separator` | `string`             | `'\n'`       | Put between two files.                                                                                                                                          |
| `header`    | `string \| function` | none         | Added once at the start. A function gets `{ files }` (in their final order) and returns the text or a promise of it.                                            |
| `footer`    | `string \| function` | none         | Added once at the end. Same forms as `header`.                                                                                                                  |

Unknown keys, an empty `order` list and an empty glob are an error when the plugin is created.

## Notes

* Gulp 5 no longer keeps the order of the globs given to `src`: `src(['vendor/*.js', 'app/*.js'])` can emit `app` files first. Use `order` when the order matters.
* The sort is stable: files matching the same glob, and files matching none, keep their stream order. Globs match dot files too.
* Every file with contents is held until the stream ends and replaced by the single result; files without contents (directories, `read: false`) pass through. An empty stream emits nothing.
* The result is placed under the `base` and `cwd` of the first file in the stream, so `dest` writes it at `name` inside the output folder. Files from different bases are joined too.
* A source map is created when any input has one (`src(…, { sourcemaps: true })`). It chains each input's own map, so it points at the original sources (a compiled `js/a.js` maps back to `ts/a.ts`), with their contents included. Inputs without a map of their own are sources themselves. Source names are relative to the base of the first file: `../app/index.js` for a file from another base. This holds when `name` contains a folder too: with `name: 'vendor/bundle.js'` the sources stay relative to the base and the input maps are still chained, so `dest(…, { sourcemaps: '.' })` writes a map that resolves.
* Two inputs with the same path relative to the base and different contents (the same file transformed twice, say) get distinct source names: `a.js`, then `a.js?2`, `a.js?3`. The same path with the same contents keeps one name.
* A byte order mark at the start of an input is removed before joining, so none ends up in the middle of the bundle (where it would be a stray character in CSS or JS).
* The result gets a copy of the `stat` of the most recently modified input, so `dest` writes it with that modification time and plugins that compare times (`file-changed`, `gulp-newer`) work on bundles. When no input has a `stat`, the result has none.
* An empty header or footer adds nothing.

## Migrating

### From gulp-concat

| gulp-concat                            | file-concat                                                     |
| -------------------------------------- | --------------------------------------------------------------- |
| `concat('all.js')`                     | `fileConcat({ name: 'all.js' })`                                |
| `concat('all.js', { newLine: ';' })`   | `separator: ';'`                                                |
| `concat({ path: 'all.js', stat })`     | `name`; the stat comes from the newest input                    |
| `gulp-header`, `gulp-footer`           | `header`, `footer`                                              |
| `gulp-order`, the order of `src` globs | `order`                                                         |
| `gulp-sourcemaps` `init()` / `write()` | `src(…, { sourcemaps: true })` / `dest(…, { sourcemaps: '.' })` |

### From 1.x

file-concat is new in 2.0; there was no 1.x.
