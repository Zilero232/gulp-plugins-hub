---
url: /gulp-plugins-hub/plugins/refilename.md
description: >-
  Rename files in a gulp stream with a new name, a prefix or suffix, another
  extension or folder, or a function of the path parts; a typed gulp-rename
  replacement.
---

# refilename

Renames every file in the stream: a new name, a prefix or suffix, another extension or folder, or whatever a function of the path returns. Source maps follow the new name. It replaces gulp-rename.

```sh
npm install --save-dev @zilero/gulp-refilename
```

## Usage

```ts
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

The option is one of three things:

```js
refilename('bundle.js'); // a new file name, the folder stays
refilename({ prefix: 'v2-', extname: '.mjs' }); // changes to the parts of the path
refilename(({ parts, file }) => ({ dirname: 'styles', stem: parts.stem.toLowerCase() })); // a function
refilename(({ parts }) => {
  parts.stem += '.min'; // or a function that changes the parts in place
});
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

What the object leaves out stays as it was. Unknown keys are an error, so a typo such as `stemm` fails when the plugin is created instead of doing nothing (`Unknown key "stemm"; expected dirname, stem, extname, prefix or suffix`). Keys from gulp-rename and `path.parse` get a hint: `basename` and `name` → `stem`, `ext` → `extname`, `dir` → `dirname` (`Unknown key "basename" (use stem)`).

These values are rejected:

* `dirname` that is absolute or leaves the base, such as `'../out'` (`Expected a folder inside the base`);
* an empty `stem`, or a `stem` of `'.'` or `'..'` (`Expected a file name without the extension`);
* a `stem`, `prefix` or `suffix` with `/` or `\` (`Expected part of a file name, without / or \`), since a folder separator would move the file;
* an `extname` that is not an extension, such as `'.'`, `'..js'` or one with a slash (`Expected an extension, like .js or js, or an empty string`).

### A function

`({ parts, file }) => RenameObject | void` gets a copy of the current parts and the Vinyl file. It may be async and return a promise. It works one of two ways:

* **Return the changes**: the same keys as the object option, `prefix` and `suffix` included. What it leaves out, or returns as `undefined`, stays as it was. A returned `extname` without the leading dot gets one.
* **Change `parts` in place and return nothing**, the way gulp-rename callbacks work.

```js
import { stat } from 'node:fs/promises';

refilename(async ({ parts, file }) => {
  const { mtime } = await stat(file.path);

  return { stem: `${parts.stem}-${mtime.getTime()}` }; // app.js → app-1730000000000.js
});

refilename(({ parts }) => ({ dirname: parts.dirname === '.' ? 'root' : undefined })); // only files in the base move

refilename(({ parts }) => {
  parts.stem += '.min';
  parts.dirname = 'dist';
}); // js/app.js → dist/app.min.js
```

| Part      | Example for `css/theme.min.css` |
| --------- | ------------------------------- |
| `dirname` | `css`                           |
| `stem`    | `theme.min`                     |
| `extname` | `.css`                          |

What the function returns (or the parts it changed) is checked like the object option: a `dirname` outside the base, an empty `stem`, a `stem` of `.` or `..` or with `/` or `\`, an invalid `extname`, an unknown key or a result that is not an object emits an error (`The rename function returned invalid parts: …`).

A callback written for gulp-rename, `(path) => { path.basename += '.min' }`, sets keys on the input object instead of on `parts`; it emits `The rename function gets { parts, file }: change parts.stem instead of basename, or return the changes`.

If the new path would still end up outside `file.base`, the file emits an error instead of being renamed (`… would be renamed outside its base: …`).

## Types

The package exports `RefilenameOptions` (the option), `RenameObject` (the object form, and what a function may return), `PathParts` (`dirname`, `stem`, `extname`), `RenameFunction` and `RenameInput` (`{ parts, file }`, what the function gets).

## Notes

* Every file is renamed, including files without contents (`read: false`) and streamed contents. Directories pass through under their own name: renaming a directory entry would not move the files gulp read from it.
* The stem is everything before the **last** extension: a suffix on `theme.min.css` gives `theme.min.suffix.css`.
* With `src(…, { sourcemaps: true })`, `file.sourceMap.file` is updated, so `dest(…, { sourcemaps: '.' })` writes the map under the new name.

## Recipes

Name minified files `.min`, after [js-squeezer](/plugins/js-squeezer):

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

## Migrating

### From gulp-rename

| gulp-rename                                     | refilename                                                      |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `rename('bundle.js')`                           | `refilename('bundle.js')` (no folder in the string)             |
| `rename({ dirname, basename, extname })`        | `refilename({ dirname, stem, extname })`                        |
| `rename({ prefix, suffix })`                    | `refilename({ prefix, suffix })`                                |
| `rename((path) => { path.basename += '.min' })` | `refilename(({ parts }) => { parts.stem += '.min' })`           |
| `rename((path, file) => ({ … }))`               | `refilename(({ parts, file }) => ({ … }))`                      |
| `rename({ … }, { multiExt: true })`             | not supported: the stem is everything before the last extension |

Unlike gulp-rename, directories are not renamed, and a name that would leave `file.base` is an error.

### From 1.x

* A string option now works; it was rejected before.
* A function option is new.
* Directories pass through under their own name.

See [migrating from 1.x](/guide/migration) for every package.
