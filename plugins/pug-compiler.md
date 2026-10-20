---
url: /gulp-plugins-hub/plugins/pug-compiler.md
description: >-
  Render Pug templates to HTML in a gulp stream, with locals from options or
  file.data and partials skipped.
---

# pug-compiler

Renders Pug templates to HTML from the file contents, so earlier plugins can change them. Locals come from `file.data` and an object or a function of each file, includes and `extends` resolve from the file's own path, and partials such as `_layout.pug` are dropped.

```sh
npm install --save-dev @zilero/gulp-pug-compiler
```

## Usage

```js
import { dest, src } from 'gulp';
import pugCompiler from '@zilero/gulp-pug-compiler';

export const pages = () =>
  src('src/**/*.pug')
    .pipe(pugCompiler({ data: { year: 2026 }, pugOptions: { pretty: true } })) // index.pug → index.html
    .pipe(dest('dist'));
```

`data` can be a function that returns the locals for each file, the output can have another extension, and `onBeforeCompile` changes the template before pug sees it:

```js
pugCompiler({ data: async ({ file }) => ({ page: file.stem }) }); // front matter, a JSON file next to it, …
pugCompiler({ extname: '.php' }); // index.pug → index.php
pugCompiler({ onBeforeCompile: ({ content }) => content.replaceAll('{{year}}', '2026') });
```

## Options

| Option            | Type                                                | Default   | Description                                                                                                                     |
| ----------------- | --------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pugOptions`      | `Options`                                           | —         | Passed to pug as an object: `pretty`, `doctype`, `filters`, `basedir`, … `filename` is set by the plugin.                       |
| `data`            | `object \| ({ file }) => object \| Promise<object>` | —         | Locals for every template, or a function that returns them for each file. Merged over `file.data`: these win.                   |
| `extname`         | `string`                                            | `'.html'` | The extension of the output, with its dot.                                                                                      |
| `skipPartials`    | `boolean`                                           | `true`    | Drop partials instead of rendering them: files whose name, or the name of a folder they are in below the base, starts with `_`. |
| `onBeforeCompile` | `({ content, file }) => string \| Promise<string>`  | —         | Runs on the template source before pug and returns the source to compile. The file still has its own extension.                 |
| `onAfterCompile`  | `({ content, file }) => string \| Promise<string>`  | —         | Runs on the rendered HTML and returns the final HTML. The file already has its new extension.                                   |

Unknown keys, an extension without its dot such as `'html'`, a `data` that is neither an object nor a function and a `pugOptions` that is not an object are an error when the plugin is created.

## Locals

A template is rendered with `file.data`, then `data` over it: the object, or what the function returns for the file. On a key both have, the option wins. `file.data` is the convention of [gulp-data](https://www.npmjs.com/package/gulp-data) and front-matter plugins, and is used when it is a plain object.

```js
import data from 'gulp-data';

export const pages = () =>
  src('src/pages/**/*.pug')
    .pipe(data((file) => ({ title: file.stem }))) // file.data
    .pipe(pugCompiler({ data: { siteName: 'Example' } })) // title and siteName
    .pipe(dest('dist'));
```

## Hooks

`onBeforeCompile` and `onAfterCompile` get `{ content, file }` and return the text to continue with, or a promise of it. A hook that returns anything else, say a JavaScript hook that forgets its `return`, fails the file with `onAfterCompile must return the text as a string, got undefined`. The `data` function gets `{ file }`, typed `TemplateDataInput`. The types are exported from the package: `ContentHook`, `ContentHookInput`, `TemplateData`, `TemplateDataFunction`, `TemplateDataInput`.

## Notes

* Only `.pug` and `.jade` files are rendered, in any case. Other files, and files without contents (`read: false`), pass through untouched.
* Relative includes and `extends` resolve from the file's path. Absolute ones (`include /templates/_nav.pug`) resolve from `basedir`, which defaults to `file.base`: the folder before the first glob in `src()`.
* With `skipPartials`, partials leave the stream, so they are not written to `dest`; templates still include them from disk. A partial is a file whose name starts with `_` (`_layout.pug`) or that sits in a folder whose name does, below `file.base` (`_includes/nav.pug`, `_layouts/base.pug`).
* No source maps are produced. A file that already has one (`src(…, { sourcemaps: true })`) keeps it, with `sourceMap.file` following the new extension.
* An error from pug, `data` or a hook, such as a template pug cannot compile or render, emits a PluginError with the file path.
* Templates are compiled with `compileDebug: true`, so an error while rendering quotes the lines of the compiled text, the contents as earlier plugins left them, instead of reading the file from disk. Set `pugOptions: { compileDebug: false }` to turn it off.
* The compiler is [pug](https://pugjs.org) 3; its options go through `pugOptions`.

## Migrating

### From gulp-pug

| gulp-pug                                | pug-compiler                                          |
| --------------------------------------- | ----------------------------------------------------- |
| `pug({ pretty, doctype, … })`           | `pugCompiler({ pugOptions: { pretty, doctype, … } })` |
| `data`, `locals`                        | `data`, an object or a function of the file           |
| `file.data` wins over `data`/`locals`   | `data` wins over `file.data`                          |
| `client: true` (compile to functions)   | not supported                                         |
| `pug` (your own pug instance), `jade`   | not supported: pug 3 is built in                      |
| `verbose`                               | not supported                                         |
| renders every `.pug` file, partials too | partials dropped; `skipPartials: false` keeps them    |

### From 1.x

* 1.x compiled the file from disk with `compileFile`, ignoring changes made by earlier plugins. Now the file contents are compiled.
* `data` is new: locals as an object or a function of the file.
* `extname` is new; the default stays `.html`.
* Partials (`_*.pug`) are dropped by default; 1.x rendered every `.pug` file, partials included. `skipPartials: false` keeps them.
* `onAfterCompile` moved from `pluginOptions` to the top level and gets `{ content, file }`.
* `onBeforeCompile` is new: it changes the template source before pug.
* `basedir` defaults to `file.base`, so absolute includes work without options.

See [migrating from 1.x](/guide/migration) for every package.
