# @zilero/gulp-text-replace

Replace text in the files of a gulp stream with strings or regular expressions, sync or async replacers that see the file, and add a banner or footer. Binary files are left alone.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-text-replace?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-text-replace)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-text-replace)](https://packagephobia.com/result?p=@zilero/gulp-text-replace)
[![node](https://img.shields.io/node/v/@zilero/gulp-text-replace?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-text-replace?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/text-replace)

Search and replace, a header and a footer in one plugin, with source maps that follow every change. Replaces `gulp-replace`, `gulp-header` and `gulp-footer`.

- Strings match literally and everywhere; regular expressions follow `String.prototype.replace`, `$1` and `$<name>` included.
- Replacers can be async and get the match, its groups, its offset and the file.
- Several rules applied in order, then a header and a footer (text or a function of the file).
- Source maps chain through every step, so they still point at the original text.
- Binary files (a NUL byte in the first 8000 bytes) pass through untouched.

## Install

```sh
npm install --save-dev @zilero/gulp-text-replace
# pnpm add -D @zilero/gulp-text-replace · bun add -d @zilero/gulp-text-replace
```

gulp is not a dependency: the plugin works with the gulp your project already has.

## Usage

```ts
// gulpfile.ts
import { textReplace } from '@zilero/gulp-text-replace';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const release = (): Promise<void> =>
  pipeline(
    src('dist/**/*.{html,js}', { sourcemaps: true }),
    textReplace({
      rules: [
        { search: '__VERSION__', replace: '2.0.0' }, // literal, every occurrence
        { search: /https?:\/\/localhost:\d+/g, replace: 'https://example.com' }
      ],
      header: ({ file }) => `/*! ${file.relative} | MIT */\n`
    }),
    dest('release', { sourcemaps: '.' })
  );
```

In CommonJS: `const { textReplace } = require('@zilero/gulp-text-replace')`. The default export is the same function.

## Options

| Option       | Type                                                  | Default | Description                                                                      |
| ------------ | ----------------------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `rules`      | `ReplaceRule \| ReplaceRule[]`                        | —       | One rule or several, applied in order: each sees the result of the previous one. |
| `header`     | `string \| (({ file }) => string \| Promise<string>)` | —       | Added at the start of every file, after the rules (after a byte order mark).     |
| `footer`     | `string \| (({ file }) => string \| Promise<string>)` | —       | Added at the end of every file, after the rules.                                 |
| `skipBinary` | `boolean`                                             | `true`  | Leave files with a NUL byte in their first 8000 bytes (images, fonts) untouched. |

A rule is `{ search, replace }`:

| Key       | Type                                                                                      | Description                                                                                       |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `search`  | `string \| RegExp`                                                                        | A string matches literally, everywhere. A RegExp follows JavaScript: add `g` for every match.     |
| `replace` | `string \| (({ match, groups, namedGroups, offset, file }) => string \| Promise<string>)` | The replacement. With a RegExp, a string's `$` patterns are filled in; a function gets the match. |

At least one of `rules`, `header` or `footer` is required. Options are validated when the plugin is created: unknown keys, an empty `rules` list and an empty search string throw a `PluginError` that lists every problem.

## Replacers and header functions

A replacer runs once per match, in order, and may return a promise. It gets:

| Key           | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| `match`       | The matched text.                                                |
| `groups`      | Capture groups of a RegExp, in order; empty for a string search. |
| `namedGroups` | Named capture groups.                                            |
| `offset`      | Where the match starts in the contents.                          |
| `file`        | The Vinyl file.                                                  |

What it returns is converted with `String()`, as `String.prototype.replace` does (`2` becomes `'2'`); `undefined`, usually a forgotten `return`, emits an error instead of writing `undefined` into the file.

`header` and `footer` functions get `{ file }` and may be async; they must return a string (`header must return the text as a string, got undefined`).

## Source maps

With `src(…, { sourcemaps: true })`, `file.sourceMap` follows every replacement, the header and the footer, and chains into the file's existing map, so it still points at the original text. Maps are built only for files that have one.

## Files and errors

- Every text file is processed, whatever its extension; files without contents pass through and streamed contents (`buffer: false`) emit an error.
- A file counts as binary when its first 8000 bytes contain a NUL byte, the check git makes. With `skipBinary: false`, binary files are decoded as UTF-8 like the others.
- A header goes after a leading byte order mark, which stays the first character.
- Errors are `PluginError`s from `@zilero/gulp-text-replace` with the file's path.

## Recipes

Inline partials with an async replacer:

```ts
import { readFile } from 'node:fs/promises';

textReplace({
  rules: {
    search: /<!--\s*include:(?<name>[\w.-]+)\s*-->/g,
    replace: async ({ namedGroups }) => readFile(`src/partials/${namedGroups.name}`, 'utf8')
  }
});
```

A license banner from `package.json`:

```ts
import pkg from './package.json' with { type: 'json' };

textReplace({ header: `/*! ${pkg.name} v${pkg.version} | ${pkg.license} */\n` });
```

Quote every line:

```ts
textReplace({ rules: { search: /^/gm, replace: '> ' } });
```

## Migrating from gulp-replace, gulp-header and gulp-footer

| Before                                                        | text-replace                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `replace(search, replacement)`                                | `textReplace({ rules: { search, replace: replacement } })`    |
| several `.pipe(replace(…))`                                   | `textReplace({ rules: [ … ] })`, one pass                     |
| `replace(/(a)/g, function (match, p1, offset) { this.file })` | `replace: ({ match, groups, offset, file }) => …`             |
| `replace(search, replacement, { skipBinary: false })`         | `skipBinary: false`                                           |
| `header('/*! <%= pkg.version %> */\n', { pkg })`              | `` header: `/*! ${pkg.version} */\n` `` (no lodash templates) |
| `footer(text)`                                                | `footer: text`, or `({ file }) => text`                       |

Unlike gulp-header, the header goes after a byte order mark, and source maps follow without gulp-sourcemaps. text-replace is new in 2.0, so there is no 1.x to migrate from.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- magic-string ^1.4 and @jridgewell/remapping ^2.3 for the source maps

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/text-replace)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
