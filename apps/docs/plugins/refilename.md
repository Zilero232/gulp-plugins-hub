# refilename

Renames every file in the stream: a new name, a prefix or suffix, another extension or folder, or whatever a function of the path returns. Source maps follow the new name.

```sh
npm install --save-dev @zilero/gulp-refilename
```

## Usage

```js
import { dest, src } from 'gulp';
import refilename from '@zilero/gulp-refilename';

export const scripts = () =>
  src('src/js/*.js')
    .pipe(refilename({ suffix: '.min' })) // app.js → app.min.js
    .pipe(dest('dist/js'));
```

The option is one of three things:

```js
refilename('bundle.js'); // a new file name, the folder stays
refilename({ prefix: 'v2-', extname: '.mjs' }); // changes to the parts of the path
refilename(({ parts, file }) => ({ dirname: 'styles', stem: parts.stem.toLowerCase() })); // a function
```

## Options

The option is checked when the plugin is created; an invalid one throws a `PluginError` that lists every problem.

### A string

The new file name with its extension. The file stays in its folder: `js/app.js` with `'bundle.js'` becomes `js/bundle.js`. The string must be a file name without a folder: `'sub/app.js'` or `'sub\\app.js'` is an error (`Expected a file name without a folder; use { dirname } to move files`), and so is an empty string, `'.'` or `'..'` (`Expected a file name`).

### An object

| Option    | Type     | Default | Description                                                                                          |
| --------- | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `dirname` | `string` | none    | New folder, relative to `file.base`. `'.'` moves the file to the base. It must stay inside the base. |
| `stem`    | `string` | none    | New name without the extension. Must not be empty, `.` or `..`.                                      |
| `extname` | `string` | none    | New extension. The leading dot is optional; `''` removes the extension.                              |
| `prefix`  | `string` | none    | Added before the stem.                                                                               |
| `suffix`  | `string` | none    | Added after the stem, before the extension.                                                          |

What the object leaves out stays as it was. Unknown keys are an error, so a typo such as `stemm` fails when the plugin is created instead of doing nothing.

These values are rejected:

- `dirname` that is absolute or leaves the base, such as `'../out'` (`Expected a folder inside the base`);
- an empty `stem`, or a `stem` of `'.'` or `'..'` (`Expected a file name without the extension`);
- a `stem`, `prefix` or `suffix` with `/` or `\` (`Expected part of a file name, without / or \`), since a folder separator would move the file;
- an `extname` that is not an extension, such as `'.'`, `'..js'` or one with a slash (`Expected an extension, like .js or js, or an empty string`).

### A function

`({ parts, file }) => Partial<PathParts>` gets the current parts and the Vinyl file and returns the parts to change. It may be async and return a promise. What it leaves out, or returns as `undefined`, stays as it was. A returned `extname` without the leading dot gets one.

```js
import { stat } from 'node:fs/promises';

refilename(async ({ parts, file }) => {
  const { mtime } = await stat(file.path);

  return { stem: `${parts.stem}-${mtime.getTime()}` }; // app.js → app-1730000000000.js
});

refilename(({ parts }) => ({ dirname: parts.dirname === '.' ? 'root' : undefined })); // only files in the base move
```

| Part      | Example for `css/theme.min.css` |
| --------- | ------------------------------- |
| `dirname` | `css`                           |
| `stem`    | `theme.min`                     |
| `extname` | `.css`                          |

The function's result is checked like the same keys of the object option: a `dirname` outside the base, an empty `stem`, a `stem` of `.` or `..` or with `/` or `\`, or an invalid `extname` emits an error (`The rename function returned invalid parts: …`). Other keys it returns are ignored.

If the new path would still end up outside `file.base`, the file emits an error instead of being renamed (`… would be renamed outside its base: …`).

## Types

The package exports `RefilenameOptions` (the option), `RenameObject` (the object form), `PathParts` (`dirname`, `stem`, `extname`), `RenameFunction` and `RenameInput` (`{ parts, file }`, what the function gets).

## Notes

- Every file is renamed, including files without contents (`read: false`), streamed contents and directories.
- The stem is everything before the **last** extension: a suffix on `theme.min.css` gives `theme.min.suffix.css`.
- With `src(…, { sourcemaps: true })`, `file.sourceMap.file` is updated, so `dest(…, { sourcemaps: '.' })` writes the map under the new name.

## Migrating from 1.x

- A string option now works; it was rejected before.
- A function option is new.

See [migrating from 1.x](/guide/migration) for every package.
