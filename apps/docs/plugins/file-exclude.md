---
description: Drop files from a gulp stream by glob, regular expression, size or your own predicate, or keep only the matching ones with invert.
---

# file-exclude

Drops files from the stream: those that match a glob or regular expression, fall outside a size range or that your own check rejects. Every other file passes through untouched. With `invert: true` it keeps only those files instead.

```sh
npm install --save-dev @zilero/gulp-file-exclude
```

## Usage

```js
import { dest, src } from 'gulp';
import fileExclude from '@zilero/gulp-file-exclude';

export const copy = () =>
  src('src/**', { encoding: false })
    .pipe(fileExclude({ patterns: ['*.map', 'drafts/**'], size: { max: 1024 * 1024 } }))
    .pipe(dest('dist'));
```

The rules can be combined; a file is dropped as soon as one of them matches:

```js
fileExclude({ patterns: '*.map' }); // every source map, in any folder
fileExclude({ patterns: [/^drafts\//, /\.psd$/] }); // regular expressions on the relative path
fileExclude({ size: { min: 1 } }); // empty files
fileExclude({ exclude: ({ file }) => file.stem.startsWith('_') }); // your own check
fileExclude({ patterns: ['*.png', '*.jpg'], invert: true }); // keep only images
```

`invert` turns the plugin into a filter that keeps what the rules match, like gulp-filter: the rules run as usual, and a file is kept when one of them matches and dropped otherwise. gulp-filter's `restore` (process some files, then put the others back) has no counterpart here: use [conditional](/plugins/conditional), which sends the matching files through a branch while the rest pass through.

## Options

| Option     | Type                                        | Default | Description                                                                                                                          |
| ---------- | ------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `patterns` | `string \| RegExp \| (string \| RegExp)[]`  | none    | Globs (picomatch) or regular expressions matched against the path relative to `file.base`. An array needs at least one pattern.      |
| `size`     | `{ min?: number, max?: number }`            | none    | Drops files smaller than `min` or larger than `max` bytes. Both are non-negative integers, and `min` must not be greater than `max`. |
| `exclude`  | `({ file }) => boolean \| Promise<boolean>` | none    | Your own check, run after `patterns` and `size`: it gets one object with the Vinyl `file`; return `true` to drop the file.           |
| `invert`   | `boolean`                                   | `false` | Keep only the files a rule matches (`patterns`, `size` or `exclude`) and drop the rest.                                              |

Set at least one of `patterns`, `size` or `exclude` (`invert` alone is not a rule): options that exclude nothing are an error (`Set at least one of patterns, size or exclude`), and so is an empty `patterns` array (`Add at least one pattern`) or an empty glob. Unknown keys are an error too. Options are checked when the plugin is created.

Some globs are rejected rather than matched in a way you might not expect:

| Glob                       | Error                                                                                         | Why                                                                                                                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'!*.css'`                 | `Negated globs are not supported: list what to drop, or set invert to keep only what matches` | In gulp-filter a `!` glob means "keep", here every pattern means "drop". List the files to drop instead, or list the files to keep and set `invert: true`: `{ patterns: '*.css', invert: true }`. |
| `'drafts\\**'`             | `Expected / in globs, not \`                                                                  | Paths are matched with `/` separators on every platform, and `\` in a glob is an escape, so a Windows-style glob would never match.                                                               |
| `'/home/me/src/drafts/**'` | `Expected a glob relative to file.base, not an absolute path`                                 | Patterns are matched against `file.relative`, so an absolute glob would never match. Write it relative to the glob base of `src()`: `'drafts/**'`.                                                |

Regular expressions are not checked this way: they are tested as they are.

The package also exports the types `FileExcludeOptions`, `ExcludePredicate` and `SizeRange`.

## Notes

- Paths use `/` separators on every platform, so the same patterns work on Windows.
- A glob without a slash matches the file name in any folder: `*.map` drops `app.js.map` and `js/vendor.js.map`. A glob with a slash matches the whole relative path: `drafts/**`, `img/*.png`.
- Globs match dotfiles: `img/*.png` also drops `img/.hidden.png`.
- Regular expressions are tested against the relative path, not only the name: use `/\.png$/` or `/^drafts\//`. A global (`g`) or sticky (`y`) RegExp works too: its `lastIndex` is reset before every file, so each test starts at the beginning of the path.
- `size` uses the length of the contents, or the size on disk (`file.stat.size`) for files without Buffer contents (`read: false`, streamed contents). Directories are never dropped by `size`, and neither are files of unknown size (no contents and no `stat`).
- The rules run in order (patterns, size, then `exclude`), so `exclude` only sees the files the first two kept.

## Migrating

### From gulp-filter and gulp-ignore

| gulp-filter / gulp-ignore                        | file-exclude                                                    |
| ------------------------------------------------ | --------------------------------------------------------------- |
| `filter(['**/*.js'])` (keep matching)            | `fileExclude({ patterns: '*.js', invert: true })`               |
| `filter(['**', '!**/*.map'])`                    | `fileExclude({ patterns: '*.map' })`                            |
| `filter(pattern, { restore: true })` + `restore` | [conditional](/plugins/conditional) with a branch for the files |
| `ignore.exclude(condition)`                      | `fileExclude({ patterns })` or `fileExclude({ exclude })`       |
| `ignore.include(condition)`                      | the same with `invert: true`                                    |

### From 1.x

- A string in `patterns` is now a glob on the relative path, not a substring of the file name: replace `'.map'` with `'*.map'`.
- `size` is now `{ min, max }` instead of a `[min, max]` tuple; either bound can be left out.
- `onExclude` is renamed `exclude`; it gets `{ file }` instead of the file, and it may return a boolean as well as a promise.
- At least one rule is required.
- `invert` is new: it keeps only the matching files.

See [migrating from 1.x](/guide/migration) for every package.
