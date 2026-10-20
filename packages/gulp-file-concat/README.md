# @zilero/gulp-file-concat

Concatenate the files of a gulp stream into one, with a separator, a header and a footer, and a source map pointing at every input.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-file-concat?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-file-concat)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-file-concat)](https://packagephobia.com/result?p=@zilero/gulp-file-concat)
[![node](https://img.shields.io/node/v/@zilero/gulp-file-concat?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-file-concat?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/file-concat)

Every file of the stream is joined into one, in stream order or an order you set with globs. When the inputs have source maps, the result gets one that chains each input's own map, so it points at the original sources. Replaces `gulp-concat` (and `gulp-header`, `gulp-footer`, `gulp-order` around it).

- `order` globs, since gulp 5 no longer keeps the order of the globs given to `src`.
- Header and footer as strings or functions of the inputs, sync or async.
- Source maps chained through each input's map (TypeScript, Sass), with their contents.
- Byte order marks stripped from every input; the bundle keeps the newest input's modification time.
- Typed options, validated when the plugin is created.

## Install

```sh
npm install --save-dev @zilero/gulp-file-concat
# pnpm add -D @zilero/gulp-file-concat · bun add -d @zilero/gulp-file-concat
```

gulp is not a dependency: the plugin works with the gulp your project already has.

## Usage

```ts
// gulpfile.ts
import { fileConcat } from '@zilero/gulp-file-concat';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const scripts = (): Promise<void> =>
  pipeline(
    src('src/js/**/*.js', { sourcemaps: true }),
    fileConcat({ name: 'bundle.js', order: ['vendor/**', '**'], separator: ';\n' }),
    dest('dist/js', { sourcemaps: '.' })
  );
```

In CommonJS: `const { fileConcat } = require('@zilero/gulp-file-concat')`. The default export is the same function.

## Options

| Option      | Type                                                 | Default      | Description                                                                                                                                  |
| ----------- | ---------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | `string`                                             | —            | Required. The result's path relative to the output folder: `app.js`, `vendor/bundle.css`. Not absolute, no leading `..`.                     |
| `order`     | `string \| string[]`                                 | stream order | Globs matched against each file's path relative to `file.base`: files matching the first glob come first, then the second, …, then the rest. |
| `separator` | `string`                                             | `'\n'`       | Put between two files.                                                                                                                       |
| `header`    | `string \| ({ files }) => string \| Promise<string>` | —            | Added once at the start. A function gets the inputs in their final order.                                                                    |
| `footer`    | `string \| ({ files }) => string \| Promise<string>` | —            | Added once at the end. Same forms as `header`.                                                                                               |

Options are validated when the plugin is created: unknown keys, a missing or absolute `name`, an empty `order` list and an empty glob are errors.

## Source maps

A map is created when any input has one (`src(…, { sourcemaps: true })`). Each input's own map is chained in, so a compiled `js/a.js` maps back to `ts/a.ts`; inputs without a map are sources themselves. Source names are relative to the base of the first file (`../app/index.js` for a file from another base), also when `name` has a folder. Two inputs with the same path and different contents (one file transformed twice) are named `a.js` and `a.js?2`.

## Files and errors

- Every file with contents is held until the stream ends and replaced by the single result; files without contents (directories, `read: false`) pass through. An empty stream emits nothing.
- The result gets the `cwd` and `base` of the first file, so `dest` writes it at `name` inside the output folder.
- A leading byte order mark is removed from each input, so none ends up in the middle of the bundle.
- The result has a copy of the `stat` of the most recently modified input, so `dest` gives it that modification time and `file-changed` or `gulp-newer` can compare against it. Without any input `stat`, it has none.
- Streamed contents (`buffer: false`) emit a `PluginError` from `@zilero/gulp-file-concat`.

## Recipes

Styles in a fixed order with a banner:

```ts
fileConcat({ name: 'app.css', order: ['reset.css', 'base/**', '**'], header: '/*! My site */\n' });
```

A count of the inputs in the header:

```ts
fileConcat({ name: 'all.js', header: ({ files }) => `/* ${files.length} files */\n` });
```

Wrap scripts in an IIFE:

```ts
fileConcat({ name: 'app.js', header: '(() => {\n', footer: '\n})();', separator: ';\n' });
```

## Migrating from gulp-concat

| gulp-concat                            | file-concat                                                     |
| -------------------------------------- | --------------------------------------------------------------- |
| `concat('all.js')`                     | `fileConcat({ name: 'all.js' })`                                |
| `concat('all.js', { newLine: ';' })`   | `separator: ';'`                                                |
| `concat({ path: 'all.js', stat })`     | `name`; the stat comes from the newest input                    |
| `gulp-header`, `gulp-footer`           | `header`, `footer`                                              |
| `gulp-order`, the order of `src` globs | `order`                                                         |
| `gulp-sourcemaps` `init()` / `write()` | `src(…, { sourcemaps: true })` / `dest(…, { sourcemaps: '.' })` |

New in 2.0: there was no 1.x of this package.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- Engine: magic-string 1.x and @jridgewell/remapping 2.x for the source map, picomatch 4 for `order`

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/file-concat)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
