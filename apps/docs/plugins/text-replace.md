# text-replace

Replaces text in every file with strings or regular expressions, with sync or async replacer functions that see the match and the file, then adds an optional header and footer. Source maps follow every change. Binary files are left alone. It replaces both gulp-replace and gulp-header/gulp-footer.

```sh
npm install --save-dev @zilero/gulp-text-replace
```

## Usage

```js
import { dest, src } from 'gulp';
import textReplace from '@zilero/gulp-text-replace';

const version = '2.0.0';

export const release = () =>
  src('dist/**/*.{html,js}')
    .pipe(
      textReplace({
        rules: [
          { search: '__VERSION__', replace: version },
          { search: /https?:\/\/localhost:\d+/g, replace: 'https://example.com' }
        ],
        header: ({ file }) => `/*! ${file.relative} | MIT */\n`
      })
    )
    .pipe(dest('release'));
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

| Option       | Type                           | Default | Description                                                                                                            |
| ------------ | ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `rules`      | `ReplaceRule \| ReplaceRule[]` | none    | One rule or several, applied in order: each sees the result of the previous one.                                       |
| `header`     | `string \| function`           | none    | Added at the start of every file, after the rules. A function gets `{ file }` and returns the text or a promise of it. |
| `footer`     | `string \| function`           | none    | Added at the end of every file, after the rules. Same forms as `header`.                                               |
| `skipBinary` | `boolean`                      | `true`  | Leave files that contain a NUL byte (images, fonts, archives) untouched.                                               |

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

## Notes

- A string search with a string replacement is literal on both sides: `$&`, `$1` and other `$` patterns are inserted as written, not interpreted.
- With a RegExp, a string replacement fills in `$&`, `$1`…`$99`, `$<name>`, `` $` ``, `$'` and `$$` the way `String.prototype.replace` does. `$<name>` for a group the RegExp does not have is empty, even for a name such as `toString` (there is no prototype lookup); in a RegExp without named groups it stays as written.
- A RegExp without `g` replaces the first match only, as `String.prototype.replace` does; with a replacer function too. A global or sticky RegExp starts from the beginning in every file: its `lastIndex` never carries over.
- Empty matches are replaced too: `/^/gm` with `'> '` quotes every line.
- A file counts as binary when its first 8000 bytes contain a NUL byte, the check git makes. With `skipBinary: false`, binary files are decoded as UTF-8 like the others.
- Files without contents pass through; streamed contents (`buffer: false`) emit an error.
- Replacers run one match at a time, in order, so an async replacer can rely on the order of the calls.
- With `src(…, { sourcemaps: true })`, `file.sourceMap` follows every change (replacements, header, footer) and chains into the file's existing map, so it still points at the original text. When the file is the first step after `src`, the original text (`sourcesContent`) of the map `src` started is kept.
- Source maps are built only for files that have one: files without `file.sourceMap` skip that work.
