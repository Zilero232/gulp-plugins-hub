# @zilero/gulp-css-squeezer

Minify CSS in a gulp stream, add vendor prefixes and lower modern syntax for your browserslist targets in one pass with Lightning CSS, keeping source maps.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-css-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-css-squeezer)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-css-squeezer)](https://packagephobia.com/result?p=@zilero/gulp-css-squeezer)
[![node](https://img.shields.io/node/v/@zilero/gulp-css-squeezer?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-css-squeezer?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/css-squeezer)

Runs every `.css` file through [Lightning CSS](https://lightningcss.dev): it minifies, adds the vendor prefixes your browsers need and lowers modern syntax (nesting, `oklch()`, …) as far as they need it. Other files pass through.

Replaces `gulp-clean-css` + `gulp-autoprefixer` (or `gulp-cssnano`, `gulp-postcss` with autoprefixer).

- Targets from the `targets` option or the project's browserslist config, nearest to each file.
- Source maps chained to the map from an earlier step (a Sass compiler), without the intermediate CSS as an extra source.
- Syntax errors with their line and column; warnings to an `onWarning` hook.
- Hooks before and after Lightning CSS, sync or async.
- Typed options, validated when the plugin is created; an invalid browserslist query fails before any file is read.

## Install

```sh
npm install --save-dev @zilero/gulp-css-squeezer
# pnpm add -D @zilero/gulp-css-squeezer · bun add -d @zilero/gulp-css-squeezer
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { cssSqueezer } from '@zilero/gulp-css-squeezer';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const styles = (): Promise<void> =>
  pipeline(
    src('src/css/**/*.css', { sourcemaps: true }),
    cssSqueezer({ targets: '> 0.5%, last 2 versions, not dead' }),
    dest('dist/css', { sourcemaps: '.' })
  );
```

In CommonJS: `const { cssSqueezer } = require('@zilero/gulp-css-squeezer')`.

## Options

| Option                | Type                                                                                                       | Default                                      | Description                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `targets`             | `string \| string[]`                                                                                       | the browserslist config nearest to each file | The browsers to support, as a browserslist query: `'defaults'`, `['> 0.5%', 'not dead']`. Prefixes are added and syntax lowered for them. |
| `minify`              | `boolean`                                                                                                  | `true`                                       | Minify the output. `false` only adds prefixes and lowers syntax.                                                                          |
| `lightningcssOptions` | `Omit<TransformOptions, 'code' \| 'filename' \| 'inputSourceMap' \| 'minify' \| 'sourceMap' \| 'targets'>` | —                                            | Other Lightning CSS options: `drafts`, `nonStandard`, `errorRecovery`, `visitor`, … `cssModules` is not supported (see below).            |
| `onBeforeMinify`      | `({ content, file }) => string \| Promise<string>`                                                         | —                                            | Runs on the source before Lightning CSS and returns the stylesheet to process.                                                            |
| `onAfterMinify`       | `({ content, file }) => string \| Promise<string>`                                                         | —                                            | Runs on the output and returns the final stylesheet. The source map does not follow changes made here.                                    |
| `onWarning`           | `({ message, type, line, column, file }) => void \| Promise<void>`                                         | warnings are ignored                         | Receives each warning Lightning CSS reports, such as the rules `errorRecovery` dropped or an unknown at-rule.                             |

Options are validated when the plugin is created: unknown keys, an empty `targets`, a query browserslist does not understand (`Invalid targets: …`), a `lightningcssOptions` that is not an object or a hook that is not a function throw right away.

### Targets

The browsers come from the first of these that exists: the `targets` option; the browserslist config nearest to the file (`.browserslistrc` or the `browserslist` key of a `package.json`, looked up from the file's folder upward, once per folder); browserslist's defaults.

## Hooks

`onBeforeMinify` and `onAfterMinify` get `{ content, file }` and return the text to continue with, or a promise of it. A hook that returns something other than a string fails the file with `onAfterMinify must return the text as a string, got undefined`. Changes made in `onBeforeMinify` count as the source; changes made in `onAfterMinify` are not followed by the source map.

`onWarning` gets `{ message, type, line, column, file }` for each warning, in order, after Lightning CSS ran and before `onAfterMinify`; `line` and `column` count from 1. It may return a promise; throwing fails the file, which turns warnings into errors.

The types are exported: `ContentHook`, `ContentHookInput`, `CssWarningHook`, `CssWarningInput`.

## Source maps

With `src(…, { sourcemaps: true })`, Lightning CSS writes a map and the plugin chains it to the map the file already had, such as the one from a Sass compiler: the result points at the `.scss` sources only. Without a map on the file, none is made. Source names use `/` on every OS.

## Files and errors

- Only `.css` files are processed, extensions compared in lowercase (`MAIN.CSS` too). Other files, and files without contents (`read: false`), pass through untouched. Streamed contents emit an error.
- A syntax error emits a PluginError with `fileName`, `lineNumber` and the position in the message: `Unexpected end of input (line 3, column 4)`. `lightningcssOptions: { errorRecovery: true }` drops invalid rules instead and reports them to `onWarning`.
- `cssModules` is not supported: Lightning CSS renames the classes, but the mapping of old to new names it returns is not kept, so nothing could use it.

## Recipes

Only prefix and lower syntax, without minifying:

```ts
cssSqueezer({ minify: false });
```

Fail the build on any warning:

```ts
cssSqueezer({
  lightningcssOptions: { errorRecovery: true },
  onWarning: ({ message, line, column }) => {
    throw new Error(`${message} (line ${line}, column ${column})`);
  }
});
```

After Sass, with maps pointing at the `.scss` sources:

```ts
import { scssCompiler } from '@zilero/gulp-scss-compiler';

export const styles = (): Promise<void> =>
  pipeline(
    src('src/styles/**/*.scss', { sourcemaps: true }),
    scssCompiler(),
    cssSqueezer(),
    dest('dist/css', { sourcemaps: '.' })
  );
```

## Migrating from `gulp-clean-css` and `gulp-autoprefixer`

| gulp-clean-css / gulp-autoprefixer                   | @zilero/gulp-css-squeezer                                       |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| `cleanCSS()` + `autoprefixer()`                      | `cssSqueezer()`                                                 |
| `autoprefixer({ overrideBrowserslist })`             | `targets`                                                       |
| `cleanCSS({ compatibility: 'ie11' })`                | `targets: 'ie 11'`                                              |
| `cleanCSS({ level: 2 })`                             | the default: Lightning CSS has one level                        |
| `cleanCSS({ format: 'beautify' })`                   | `minify: false`                                                 |
| `cleanCSS(options, (details) => …)` (stats callback) | not supported; `onAfterMinify` sees the output                  |
| `autoprefixer({ cascade })`, `grid`                  | not supported                                                   |
| gulp-sourcemaps `init()` / `write('.')`              | `src(…, { sourcemaps: true })` / `dest(…, { sourcemaps: '.' })` |

New in 2.0: there is no 1.x of this package.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- Lightning CSS 1 (`^1.33.0`) and browserslist 4, installed with the plugin; Lightning CSS ships native binaries for every major platform

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/css-squeezer)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
