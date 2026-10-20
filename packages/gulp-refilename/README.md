# @zilero/gulp-refilename

Rename files in a gulp stream: a new name, a prefix or suffix, another extension or directory, or a function of the path parts.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-refilename?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-refilename)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-refilename)](https://packagephobia.com/result?p=@zilero/gulp-refilename)
[![node](https://img.shields.io/node/v/@zilero/gulp-refilename?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-refilename?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/refilename)

Renames every file in the stream and keeps its source map in step. Replaces `gulp-rename`, with the same three forms: a string, an object of changes or a function.

- A file name, `{ dirname, stem, extname, prefix, suffix }` or a function, sync or async.
- Functions return the changes or change `parts` in place, the way gulp-rename callbacks do.
- Every name is checked: a rename can never move a file out of `file.base`.
- Typos and gulp-rename keys fail with a hint (`Unknown key "basename" (use stem)`) instead of doing nothing.
- `file.sourceMap.file` follows the new name.

## Install

```sh
npm install --save-dev @zilero/gulp-refilename
# pnpm add -D @zilero/gulp-refilename · bun add -d @zilero/gulp-refilename
```

gulp is not a dependency: the plugin works with the gulp your project already has.

## Usage

```ts
// gulpfile.ts
import { refilename } from '@zilero/gulp-refilename';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const scripts = (): Promise<void> =>
  pipeline(
    src('src/js/*.js', { sourcemaps: true }),
    refilename({ suffix: '.min' }), // app.js → app.min.js
    dest('dist/js', { sourcemaps: '.' })
  );
```

In CommonJS: `const { refilename } = require('@zilero/gulp-refilename')`. The default export is the same function.

## Options

The option is one of three forms. For `js/app.js`:

| Form       | Example                                                           | Result             |
| ---------- | ----------------------------------------------------------------- | ------------------ |
| a string   | `refilename('bundle.js')`                                         | `js/bundle.js`     |
| an object  | `refilename({ prefix: 'v2-', suffix: '.min' })`                   | `js/v2-app.min.js` |
| a function | `refilename(({ parts }) => ({ stem: parts.stem.toUpperCase() }))` | `js/APP.js`        |

A string is the new file name with its extension; the file stays in its folder. It must not contain `/` or `\` (use `{ dirname }` to move files) and must not be empty, `.` or `..`.

The object (and what a function returns):

| Key       | Type     | Default | Description                                                                                 |
| --------- | -------- | ------- | ------------------------------------------------------------------------------------------- |
| `dirname` | `string` | —       | New folder, relative to `file.base`; `'.'` moves the file to the base. Must stay inside it. |
| `stem`    | `string` | —       | New name without the extension. Not empty, `.` or `..`, no `/` or `\`.                      |
| `extname` | `string` | —       | New extension; the leading dot is optional and `''` removes the extension.                  |
| `prefix`  | `string` | —       | Added before the stem. No `/` or `\`.                                                       |
| `suffix`  | `string` | —       | Added after the stem, before the extension. No `/` or `\`.                                  |

What it leaves out stays as it was. Unknown keys are an error, with the key to use for gulp-rename's and `path.parse`'s names (`basename` and `name` → `stem`, `ext` → `extname`, `dir` → `dirname`).

The function: `({ parts, file }) => RenameObject | void | Promise<RenameObject | void>`.

Options are validated when the plugin is created: an invalid one throws a `PluginError` that lists every problem.

## The rename function

It runs for every file and gets `parts` (a copy of `dirname`, `stem` and `extname`, relative to `file.base`) and the Vinyl `file`. It may be async. Either:

- return the changes, checked like the object option (`prefix` and `suffix` included); keys it leaves out or returns as `undefined` stay;
- or change `parts` in place and return nothing.

```ts
refilename(({ parts }) => {
  parts.stem += '.min';
  parts.dirname = 'dist';
}); // js/app.js → dist/app.min.js
```

| Part      | For `css/theme.min.css` |
| --------- | ----------------------- |
| `dirname` | `css`                   |
| `stem`    | `theme.min`             |
| `extname` | `.css`                  |

## Source maps

With `src(…, { sourcemaps: true })`, `file.sourceMap.file` is set to the new relative path, so `dest(…, { sourcemaps: '.' })` writes the map under the new name.

## Files and errors

- Every file is renamed, including files without contents (`read: false`) and streamed contents. Directories pass through under their own name.
- The stem is everything before the **last** extension: a suffix on `theme.min.css` gives `theme.min<suffix>.css`.
- A function that returns invalid parts emits `The rename function returned invalid parts: …`; one written for gulp-rename that sets `input.stem` instead of `parts.stem` emits a hint to use `parts`.
- A rename that would still leave `file.base` emits `… would be renamed outside its base: …`.
- Errors are `PluginError`s from `@zilero/gulp-refilename` with the file's path.

## Recipes

Name minified files `.min`, after [js-squeezer](https://zilero232.github.io/gulp-plugins-hub/plugins/js-squeezer):

```ts
import { jsSqueezer } from '@zilero/gulp-js-squeezer';

pipeline(src('src/js/*.js'), jsSqueezer(), refilename({ suffix: '.min' }), dest('dist/js'));
```

Flatten a tree into one folder:

```ts
refilename({ dirname: '.' }); // a/b/c.png → c.png
```

Lowercase names, keeping folders:

```ts
refilename(({ parts }) => ({ stem: parts.stem.toLowerCase(), extname: parts.extname.toLowerCase() }));
```

## Migrating from gulp-rename

| gulp-rename                                     | refilename                                                      |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `rename('bundle.js')`                           | `refilename('bundle.js')` (no folder in the string)             |
| `rename({ dirname, basename, extname })`        | `refilename({ dirname, stem, extname })`                        |
| `rename({ prefix, suffix })`                    | `refilename({ prefix, suffix })`                                |
| `rename((path) => { path.basename += '.min' })` | `refilename(({ parts }) => { parts.stem += '.min' })`           |
| `rename((path, file) => ({ … }))`               | `refilename(({ parts, file }) => ({ … }))`                      |
| `rename({ … }, { multiExt: true })`             | not supported: the stem is everything before the last extension |

Unlike gulp-rename, directories are not renamed, and a name that leaves `file.base` is an error.

### From 1.x

- A string option and a function option are new; 1.x took an object only.
- Directories now pass through under their own name.
- An unknown key is an error that names the key to use.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- No engine: plain `node:path`

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/refilename)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
