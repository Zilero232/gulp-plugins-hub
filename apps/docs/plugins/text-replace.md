---
description: Replace text in gulp streams with strings, regular expressions or async replacers, add a header and footer, and keep source maps; replaces gulp-replace and gulp-header.
---

# text-replace

Replaces text in every file with strings or regular expressions, with sync or async replacer functions that see the match and the file, then adds an optional header and footer. Source maps follow every change. Binary files are left alone. It replaces both gulp-replace and gulp-header/gulp-footer.

```sh
npm install --save-dev @zilero/gulp-text-replace
```

## Usage

```ts
import { textReplace } from '@zilero/gulp-text-replace';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

const version = '2.0.0';

export const release = (): Promise<void> =>
  pipeline(
    src('dist/**/*.{html,js}', { sourcemaps: true }),
    textReplace({
      rules: [
        { search: '__VERSION__', replace: version },
        { search: /https?:\/\/localhost:\d+/g, replace: 'https://example.com' }
      ],
      header: ({ file }) => `/*! ${file.relative} | MIT */\n`
    }),
    dest('release', { sourcemaps: '.' })
  );
```

A replacer function gets the match, its groups, its offset and the file, and can be async:

```js
import { readFile } from 'node:fs/promises';

textReplace({
  rules: {
    search: /<!--\s*include:(?<name>[\w.-]+)\s*-->/g,
    replace: async ({ namedGroups }) => readFile(`src/partials/${namedGroups.name}`, 'utf8')
  }
});
```

## Options

| Option       | Type                           | Default | Description                                                                                                                                        |
| ------------ | ------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rules`      | `ReplaceRule \| ReplaceRule[]` | none    | One rule or several, applied in order: each sees the result of the previous one.                                                                   |
| `header`     | `string \| function`           | none    | Added at the start of every file, after the rules and after a byte order mark. A function gets `{ file }` and returns the text or a promise of it. |
| `footer`     | `string \| function`           | none    | Added at the end of every file, after the rules. Same forms as `header`.                                                                           |
| `skipBinary` | `boolean`                      | `true`  | Leave files that contain a NUL byte (images, fonts, archives) untouched.                                                                           |

At least one of `rules`, `header` or `footer` is required ("Set at least one of rules, header or footer"). Unknown keys, an empty `rules` list and an empty search string are an error when the plugin is created.

### A rule

| Key       | Type                 | Description                                                                                                                          |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `search`  | `string \| RegExp`   | A string matches literally, everywhere it occurs. A RegExp follows JavaScript: add `g` for every match.                              |
| `replace` | `string \| function` | The replacement. With a RegExp, a string's `$` patterns are filled in (see below). A function returns the replacement for one match. |

The replacer function gets one object:

| Field         | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| `match`       | The matched text.                                                |
| `groups`      | Capture groups of a RegExp, in order; empty for a string search. |
| `namedGroups` | Named capture groups.                                            |
| `offset`      | Where the match starts in the contents.                          |
| `file`        | The Vinyl file.                                                  |

What a replacer returns is converted with `String()`, as `String.prototype.replace` does: a number `2` is written as `2`, `null` as `null`. `undefined`, which is what a replacer that forgot to `return` gives, emits an error instead (`The replacer for /a/ returned undefined; return the replacement text`), rather than deleting the match or writing `undefined`.

A `header` or `footer` function must return a string; anything else emits an error (`header must return the text as a string, got undefined`).

The package also exports the types `TextReplaceOptions`, `ReplaceRule`, `Replacer`, `ReplacerInput` and `FileText`.

## Notes

- A string search with a string replacement is literal on both sides: `$&`, `$1` and other `$` patterns are inserted as written, not interpreted.
- With a RegExp, a string replacement fills in `$&`, `$1`…`$99`, `$<name>`, `` $` ``, `$'` and `$$` the way `String.prototype.replace` does. `$<name>` for a group the RegExp does not have is empty, even for a name such as `toString` (there is no prototype lookup); in a RegExp without named groups it stays as written.
- A RegExp without `g` replaces the first match only, as `String.prototype.replace` does; with a replacer function too. A global or sticky RegExp starts from the beginning in every file: its `lastIndex` never carries over.
- Empty matches are replaced too: `/^/gm` with `'> '` quotes every line.
- A header goes after a leading byte order mark (U+FEFF), which stays the first character of the file.
- A file counts as binary when its first 8000 bytes contain a NUL byte, the check git makes. With `skipBinary: false`, binary files are decoded as UTF-8 like the others.
- Files without contents pass through; streamed contents (`buffer: false`) emit an error.
- Replacers run one match at a time, in order, so an async replacer can rely on the order of the calls.
- With `src(…, { sourcemaps: true })`, `file.sourceMap` follows every change (replacements, header, footer) and chains into the file's existing map, so it still points at the original text. When the file is the first step after `src`, the original text (`sourcesContent`) of the map `src` started is kept.
- Source maps are built only for files that have one: files without `file.sourceMap` skip that work.

## Recipes

A license banner from `package.json`:

```ts
import pkg from './package.json' with { type: 'json' };

textReplace({ header: `/*! ${pkg.name} v${pkg.version} | ${pkg.license} */\n` });
```

Quote every line:

```ts
textReplace({ rules: { search: /^/gm, replace: '> ' } });
```

Number the occurrences of a placeholder:

```ts
textReplace({ rules: { search: '__ID__', replace: ({ offset }) => String(offset) } });
```

## Migrating

### From gulp-replace, gulp-header and gulp-footer

| Before                                                        | text-replace                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `replace(search, replacement)`                                | `textReplace({ rules: { search, replace: replacement } })`    |
| several `.pipe(replace(…))`                                   | `textReplace({ rules: [ … ] })`, one pass                     |
| `replace(/(a)/g, function (match, p1, offset) { this.file })` | `replace: ({ match, groups, offset, file }) => …`             |
| `replace(search, replacement, { skipBinary: false })`         | `skipBinary: false`                                           |
| `header('/*! <%= pkg.version %> */\n', { pkg })`              | `` header: `/*! ${pkg.version} */\n` `` (no lodash templates) |
| `footer(text)`                                                | `footer: text`, or `({ file }) => text`                       |

Unlike gulp-header, the header goes after a byte order mark, and source maps follow every change without gulp-sourcemaps.

### From 1.x

text-replace is new in 2.0: there is no 1.x to migrate from.
