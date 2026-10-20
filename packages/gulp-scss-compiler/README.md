# @zilero/gulp-scss-compiler

Compile SCSS and indented Sass with the modern Sass compiler (sass-embedded) in a gulp stream: one compiler process per stream, partials skipped, source maps kept.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-scss-compiler?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-scss-compiler)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-scss-compiler)](https://packagephobia.com/result?p=@zilero/gulp-scss-compiler)
[![node](https://img.shields.io/node/v/@zilero/gulp-scss-compiler?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-scss-compiler?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/scss-compiler)

Compiles `.scss` and `.sass` files to `.css` with [sass-embedded](https://sass-lang.com/dart-sass/), the Dart Sass compiler, from the file contents, so earlier plugins and the hooks can change them. Other files pass through.

Replaces `gulp-sass` (with `sass` or `sass-embedded`) and `gulp-dart-sass`.

- One compiler process serves the whole stream and stops when it ends, fails or is destroyed.
- Partials (`_variables.scss`) are dropped from the stream; `@use` resolves from the file and from `file.base`.
- Source maps with the sources included, chained to the map the file arrived with.
- Errors point at the stylesheet where they happened, often a partial, and its line.
- Typed options, validated when the plugin is created.

## Install

```sh
npm install --save-dev @zilero/gulp-scss-compiler
# pnpm add -D @zilero/gulp-scss-compiler · bun add -d @zilero/gulp-scss-compiler
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { scssCompiler } from '@zilero/gulp-scss-compiler';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const styles = (): Promise<void> =>
  pipeline(
    src('src/styles/**/*.scss', { sourcemaps: true }),
    scssCompiler({ sassOptions: { style: 'compressed' } }), // main.scss → main.css
    dest('dist/css', { sourcemaps: '.' }) // main.css and main.css.map
  );
```

In CommonJS: `const { scssCompiler } = require('@zilero/gulp-scss-compiler')`.

## Options

| Option            | Type                                                                                          | Default | Description                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `sassOptions`     | `Omit<StringOptions<'async'>, 'sourceMap' \| 'sourceMapIncludeSources' \| 'syntax' \| 'url'>` | `{}`    | Passed to Sass: `style`, `loadPaths` (`file.base` is always searched too), `importers`, `functions`, `silenceDeprecations`, `logger`, …         |
| `skipPartials`    | `boolean`                                                                                     | `true`  | Drop partials, files whose name starts with `_`, instead of compiling them on their own.                                                        |
| `onBeforeCompile` | `({ content, file }) => string \| Promise<string>`                                            | —       | Runs on the source before Sass and returns the source to compile.                                                                               |
| `onAfterCompile`  | `({ content, file }) => string \| Promise<string>`                                            | —       | Runs on the compiled CSS, with the file already renamed to `.css`, and returns the final CSS. The source map does not follow changes made here. |

Options are validated when the plugin is created: unknown keys, a `sassOptions` that is not an object or a hook that is not a function throw right away.

## Hooks

Both hooks get `{ content, file }` and return the text to continue with, or a promise of it. `onBeforeCompile` sees the file with its own extension, `onAfterCompile` after the rename to `.css`. A hook that returns something other than a string fails the file with `onAfterCompile must return the text as a string, got undefined`. Changes made in `onBeforeCompile` count as the source; changes made in `onAfterCompile` are not followed by the source map. The types are exported: `import type { ContentHook } from '@zilero/gulp-scss-compiler'`.

## Source maps

With `src(…, { sourcemaps: true })`, Sass writes a map with the sources included, relative to `file.base`, and `sourceMap.file` follows the rename to `.css`. When the file arrived with a map of its own (generated SCSS, a template step before), the Sass map is chained to it, so it points at that map's sources. Without a map on the file, none is made.

## Files and errors

- `.scss` is compiled as SCSS and `.sass` as the indented syntax, extensions compared in lowercase (`MAIN.SCSS` too); both become `.css`. Other files, plain `.css` included, and files without contents (`read: false`) pass through untouched. Streamed contents emit an error.
- With `skipPartials`, partials leave the stream, so they are not written to `dest`; other files still load them from disk.
- A Sass error emits a PluginError from `@zilero/gulp-scss-compiler` with `fileName` and `lineNumber` of the stylesheet where it happened and Sass's own message, without the `Error:` prefix. Other errors, from a hook for example, name the file being compiled.
- A compiler that fails to start (the sass-embedded binary for your platform is missing) fails the file that needed it; the start is not retried.

## Recipes

Compressed output with a load path for `node_modules`:

```ts
scssCompiler({ sassOptions: { style: 'compressed', loadPaths: ['node_modules'] } });
```

Silence deprecation warnings from a dependency:

```ts
scssCompiler({ sassOptions: { quietDeps: true, silenceDeprecations: ['import'] } });
```

Prefix and minify the result, with maps that still point at the `.scss` sources:

```ts
import { cssSqueezer } from '@zilero/gulp-css-squeezer';

export const styles = (): Promise<void> =>
  pipeline(
    src('src/styles/**/*.scss', { sourcemaps: true }),
    scssCompiler(),
    cssSqueezer(),
    dest('dist/css', { sourcemaps: '.' })
  );
```

## Migrating from `gulp-sass`

| gulp-sass                                 | @zilero/gulp-scss-compiler                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `gulpSass(sass)(options)`, `sass.sync(…)` | `scssCompiler({ sassOptions })`: sass-embedded is built in                    |
| `outputStyle: 'compressed'`               | `sassOptions: { style: 'compressed' }`                                        |
| `includePaths`                            | `sassOptions.loadPaths`                                                       |
| `indentedSyntax: true`                    | the `.sass` extension                                                         |
| `.on('error', sass.logError)`             | errors are PluginErrors with the file and line; handle them as for any plugin |
| gulp-sourcemaps `init()` / `write('.')`   | `src(…, { sourcemaps: true })` / `dest(…, { sourcemaps: '.' })`               |
| partials skipped                          | the same, `skipPartials: false` keeps them                                    |

### From 1.x

- `scssOptions` is renamed to `sassOptions`; `url`, `syntax` and `sourceMap` are no longer options because they come from the file.
- 1.x compiled the file from disk, so the result of `onBeforeCompile` was ignored. Now the file contents are compiled.
- One sass-embedded compiler serves each stream instead of a Sass process per file.
- `.sass` files with the indented syntax are supported; partials are dropped by default.
- Source maps are applied when the file has one; 1.x applied none.
- The hooks moved from `pluginOptions` to the top level and get `{ content, file }`.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- sass-embedded 1 (`^1.105.2`), installed with the plugin with the compiler binary for your platform

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/scss-compiler)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
