# @zilero/gulp-file-exclude

Drop files from a gulp stream by glob, regular expression, size or your own predicate.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-file-exclude?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-file-exclude)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-file-exclude)](https://packagephobia.com/result?p=@zilero/gulp-file-exclude)
[![node](https://img.shields.io/node/v/@zilero/gulp-file-exclude?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-file-exclude?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/file-exclude)

A file is dropped as soon as one rule matches it; every other file passes through untouched. With `invert`, it is the other way round: only the matching files are kept. Replaces `gulp-filter` and `gulp-ignore`.

- Globs (picomatch) and RegExps on the path relative to `file.base`, with `/` on every platform.
- A glob without a slash matches the name in any folder: `*.map` drops every source map.
- Size ranges in bytes, using the size on disk for files read without contents.
- Your own predicate, sync or async.
- Typed options, validated when the plugin is created; globs that would never match are rejected.

## Install

```sh
npm install --save-dev @zilero/gulp-file-exclude
# pnpm add -D @zilero/gulp-file-exclude · bun add -d @zilero/gulp-file-exclude
```

gulp is not a dependency: the plugin works with the gulp your project already has.

## Usage

```ts
// gulpfile.ts
import { fileExclude } from '@zilero/gulp-file-exclude';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const copy = (): Promise<void> =>
  pipeline(
    src('src/**', { encoding: false }),
    fileExclude({ patterns: ['*.map', 'drafts/**'], size: { max: 1024 * 1024 } }),
    dest('dist')
  );
```

In CommonJS: `const { fileExclude } = require('@zilero/gulp-file-exclude')`. The default export is the same function.

## Options

| Option     | Type                                        | Default | Description                                                                                                               |
| ---------- | ------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `patterns` | `string \| RegExp \| (string \| RegExp)[]`  | —       | Globs or RegExps matched against `file.relative` with `/` separators. An array needs at least one pattern.                |
| `size`     | `{ min?: number, max?: number }`            | —       | Matches files smaller than `min` or larger than `max` bytes. Non-negative integers; `min` must not be greater than `max`. |
| `exclude`  | `({ file }) => boolean \| Promise<boolean>` | —       | Your own check, after `patterns` and `size`: return `true` to match the file.                                             |
| `invert`   | `boolean`                                   | `false` | Keep only the files a rule matches and drop the rest, like `gulp-filter`.                                                 |

Set at least one of `patterns`, `size` or `exclude`. Options are validated when the plugin is created: options that match nothing (`Set at least one of patterns, size or exclude`), an empty `patterns` array, an empty glob, unknown keys, a reversed size range and globs that would never match are errors:

| Glob                       | Why it is rejected                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `'!*.css'`                 | Every pattern means "match"; to keep only some files, list them and set `invert: true`. |
| `'drafts\\**'`             | Paths use `/` on every platform, and `\` in a glob is an escape.                        |
| `'/home/me/src/drafts/**'` | Patterns are matched against `file.relative`: write `'drafts/**'`.                      |

## Files and errors

- Every file goes through the rules, including files without contents and directories.
- `size` uses the length of the contents, or `file.stat.size` for files without Buffer contents. Directories and files of unknown size never match `size`.
- The rules run in order (patterns, size, then `exclude`), so `exclude` is not called for a file an earlier rule matched.
- Globs match dotfiles. A global or sticky RegExp is reset before every file.
- An error thrown by `exclude` is emitted as a `PluginError` from `@zilero/gulp-file-exclude`, with the file's path.

## Recipes

Drop source maps and empty files:

```ts
fileExclude({ patterns: '*.map', size: { min: 1 } });
```

Keep only images:

```ts
fileExclude({ patterns: /\.(png|jpe?g|webp|avif)$/i, invert: true });
```

Skip Sass partials:

```ts
fileExclude({ exclude: ({ file }) => file.stem.startsWith('_') });
```

## Migrating from gulp-filter and gulp-ignore

| gulp-filter / gulp-ignore                        | file-exclude                                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `filter(['**/*.js'])` (keep matching)            | `fileExclude({ patterns: '*.js', invert: true })`                                                    |
| `filter(['**', '!**/*.map'])`                    | `fileExclude({ patterns: '*.map' })`                                                                 |
| `filter(pattern, { restore: true })` + `restore` | `conditional` from `@zilero/gulp-conditional`: process some files in a branch, the rest pass through |
| `ignore.exclude(condition)`                      | `fileExclude({ patterns })` or `fileExclude({ exclude })`                                            |
| `ignore.include(condition)`                      | the same with `invert: true`                                                                         |

### From 1.x

- A string in `patterns` is a glob on the relative path, not a substring of the file name: `'.map'` becomes `'*.map'`.
- `size` is `{ min, max }` instead of a `[min, max]` tuple; either bound can be left out.
- `onExclude` is renamed `exclude`; it gets `{ file }` and may return a boolean or a promise.
- At least one rule is required. `invert` is new.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- Engine: picomatch 4 (via `@zilero/gulp-plugin-factory`)

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/file-exclude)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
