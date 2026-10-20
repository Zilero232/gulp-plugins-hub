# @zilero/gulp-pug-compiler

Compile Pug templates to HTML in a gulp stream, with per-file data, includes from the file contents and your own extension.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-pug-compiler?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-pug-compiler)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-pug-compiler)](https://packagephobia.com/result?p=@zilero/gulp-pug-compiler)
[![node](https://img.shields.io/node/v/@zilero/gulp-pug-compiler?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-pug-compiler?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/pug-compiler)

Renders `.pug` and `.jade` templates to HTML with [pug](https://pugjs.org) 3, from the file contents, so earlier plugins and the hooks can change them. Other files pass through.

Replaces `gulp-pug`.

- Locals from an object, a function of each file, and `file.data` set by gulp-data or a front-matter plugin.
- Includes and `extends` resolve from the file's path; absolute ones from `file.base`.
- Partials (`_layout.pug`, `_includes/nav.pug`) are dropped from the stream.
- Any output extension (`.php`, `.njk`); hooks before and after pug, sync or async.
- Typed options, validated when the plugin is created.

## Install

```sh
npm install --save-dev @zilero/gulp-pug-compiler
# pnpm add -D @zilero/gulp-pug-compiler · bun add -d @zilero/gulp-pug-compiler
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { pugCompiler } from '@zilero/gulp-pug-compiler';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const pages = (): Promise<void> =>
  pipeline(
    src('src/pages/**/*.pug'),
    pugCompiler({ data: { year: 2026 }, pugOptions: { pretty: true } }), // index.pug → index.html
    dest('dist')
  );
```

In CommonJS: `const { pugCompiler } = require('@zilero/gulp-pug-compiler')`.

## Options

| Option            | Type                                                                             | Default   | Description                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `pugOptions`      | `Omit<Options, 'filename'>`                                                      | —         | Passed to pug: `pretty`, `doctype`, `filters`, `basedir` (default `file.base`), `compileDebug` (default `true`), … |
| `data`            | `Record<string, unknown> \| ({ file }) => Record<string, unknown> \| Promise<…>` | —         | Locals for every template, or a function that returns them for each file. Merged over `file.data`: these win.      |
| `extname`         | `string`                                                                         | `'.html'` | The extension of the output, with its dot.                                                                         |
| `skipPartials`    | `boolean`                                                                        | `true`    | Drop partials: files whose name, or the name of a folder they are in below the base, starts with `_`.              |
| `onBeforeCompile` | `({ content, file }) => string \| Promise<string>`                               | —         | Runs on the template source before pug and returns the source to compile. The file still has its own extension.    |
| `onAfterCompile`  | `({ content, file }) => string \| Promise<string>`                               | —         | Runs on the rendered HTML and returns the final HTML. The file already has its new extension.                      |

Options are validated when the plugin is created: unknown keys, an extension without its dot (`'html'`), a `data` that is neither an object nor a function, a `pugOptions` that is not an object or a hook that is not a function throw right away.

## Locals

A template is rendered with `file.data`, then `data` (the object, or what the function returns for the file) over it, so the option wins on a key both have. `file.data` is the convention of gulp-data and front-matter plugins; it is used when it is a plain object.

```ts
import data from 'gulp-data';

pipeline(
  src('src/pages/**/*.pug'),
  data((file) => ({ title: file.stem })), // file.data
  pugCompiler({ data: { siteName: 'Example' } }),
  dest('dist')
);
```

## Hooks

`onBeforeCompile` and `onAfterCompile` get `{ content, file }` and return the text to continue with, or a promise of it. A hook that returns something other than a string fails the file with `onAfterCompile must return the text as a string, got undefined`. The `data` function gets `{ file }` (`TemplateDataInput`). The types are exported: `ContentHook`, `ContentHookInput`, `TemplateData`, `TemplateDataFunction`, `TemplateDataInput`.

## Files and errors

- `.pug` and `.jade` files are rendered, extensions compared in lowercase (`INDEX.PUG` too). Other files, and files without contents (`read: false`), pass through untouched. Streamed contents emit an error.
- With `skipPartials`, partials leave the stream, so they are not written to `dest`; templates still include them from disk. A partial is a file whose name starts with `_` (`_layout.pug`) or that sits in a folder whose name does, below `file.base` (`_includes/nav.pug`).
- No source maps are produced. A file that already has one keeps it, with `sourceMap.file` following the new extension.
- An error from pug, `data` or a hook emits a PluginError from `@zilero/gulp-pug-compiler` with `fileName` set to the file path. With `compileDebug: true` (the default), a render error quotes the compiled text, not a file on disk.

## Recipes

Locals from a JSON file next to each page:

```ts
import { readFile } from 'node:fs/promises';

pugCompiler({
  data: async ({ file }) => JSON.parse(await readFile(file.path.replace(/\.pug$/, '.json'), 'utf8'))
});
```

Render to PHP:

```ts
pugCompiler({ extname: '.php' }); // index.pug → index.php
```

Render, then minify:

```ts
import { htmlSqueezer } from '@zilero/gulp-html-squeezer';

pipeline(src('src/pages/**/*.pug'), pugCompiler(), htmlSqueezer(), dest('dist'));
```

## Migrating from `gulp-pug`

| gulp-pug                                | @zilero/gulp-pug-compiler                             |
| --------------------------------------- | ----------------------------------------------------- |
| `pug({ pretty, doctype, … })`           | `pugCompiler({ pugOptions: { pretty, doctype, … } })` |
| `data`, `locals`                        | `data`, an object or a function of the file           |
| `file.data` wins over `data` / `locals` | `data` wins over `file.data`                          |
| `client: true` (compile to functions)   | not supported                                         |
| `pug` (your own pug instance), `jade`   | not supported: pug 3 is built in                      |
| `verbose`                               | not supported                                         |
| renders every `.pug` file, partials too | partials dropped; `skipPartials: false` keeps them    |

### From 1.x

- 1.x compiled the file from disk with `compileFile`, ignoring changes made by earlier plugins. Now the file contents are compiled.
- `data`, `extname` and `onBeforeCompile` are new; the output extension stays `.html` by default.
- Partials are dropped by default; 1.x rendered every `.pug` file. `skipPartials: false` keeps them.
- `onAfterCompile` moved from `pluginOptions` to the top level and gets `{ content, file }`.
- `basedir` defaults to `file.base`, so absolute includes work without options.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- pug 3 (`^3.0.4`), installed with the plugin

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/pug-compiler)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
