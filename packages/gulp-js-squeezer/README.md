# @zilero/gulp-js-squeezer

Minify JavaScript in a gulp stream with terser, keeping source maps.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-js-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-js-squeezer)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-js-squeezer)](https://packagephobia.com/result?p=@zilero/gulp-js-squeezer)
[![node](https://img.shields.io/node/v/@zilero/gulp-js-squeezer?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-js-squeezer?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/js-squeezer)

Minifies `.js`, `.mjs` and `.cjs` files with [terser](https://terser.org) and passes everything else through. When a file has a source map, the new map is chained to it, so the minified code still points at the original sources.

Replaces `gulp-terser` and `gulp-uglify`.

- Every terser option through `terserOptions`; `sourceMap` follows the file.
- Source maps chained to the map from a bundler or an earlier plugin, without gulp-sourcemaps.
- `.mjs` minified as an ES module and `.cjs` as a script, unless you set `module`.
- Hooks before and after terser, sync or async.
- Typed options, validated when the plugin is created.

## Install

```sh
npm install --save-dev @zilero/gulp-js-squeezer
# pnpm add -D @zilero/gulp-js-squeezer · bun add -d @zilero/gulp-js-squeezer
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { jsSqueezer } from '@zilero/gulp-js-squeezer';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const scripts = (): Promise<void> =>
  pipeline(
    src('src/js/**/*.js', { sourcemaps: true }),
    jsSqueezer({ terserOptions: { compress: { drop_console: true } } }),
    dest('dist/js', { sourcemaps: '.' }) // app.js and app.js.map
  );
```

In CommonJS: `const { jsSqueezer } = require('@zilero/gulp-js-squeezer')`.

## Options

| Option           | Type                                               | Default | Description                                                                                                                                                      |
| ---------------- | -------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terserOptions`  | `Omit<MinifyOptions, 'sourceMap'>`                 | `{}`    | Passed to terser's `minify`: `compress`, `mangle`, `format`, `module`, … Without `module`, `.mjs` files are minified as ES modules and `.js`, `.cjs` as scripts. |
| `onBeforeMinify` | `({ content, file }) => string \| Promise<string>` | —       | Runs on the source before terser and returns the code to minify.                                                                                                 |
| `onAfterMinify`  | `({ content, file }) => string \| Promise<string>` | —       | Runs on terser's output and returns the final code. The source map does not follow changes made here.                                                            |

Options are validated when the plugin is created: unknown keys, a `terserOptions` that is not an object or a hook that is not a function throw right away.

## Hooks

`onBeforeMinify` and `onAfterMinify` get `{ content, file }`, where `content` is the text at that step and `file` the Vinyl file, and return the text to continue with, or a promise of it. A hook that returns something other than a string fails the file with `onAfterMinify must return the text as a string, got undefined`.

The source map describes terser's output: changes made in `onBeforeMinify` count as the original source, and changes made in `onAfterMinify` are not followed by the map. For a banner with a correct map, use terser's `format: { preamble }` instead.

The types are exported: `import type { ContentHook } from '@zilero/gulp-js-squeezer'`.

## Source maps

With `src(…, { sourcemaps: true })`, terser writes a map with the sources included and chains it to the map the file already had; `dest(…, { sourcemaps: '.' })` writes it next to the file. Without a map on the file, none is made. Source names are relative to `file.base` and use `/` on every OS.

## Files and errors

- `.js`, `.mjs` and `.cjs` files are minified, extensions compared in lowercase (`APP.JS` too). Other files, and files without contents (`read: false`), pass through untouched. Streamed contents emit an error.
- `module` follows the extension unless `terserOptions.module` is set: `true` for `.mjs`, `false` for `.cjs` and `.js` (terser's default).
- An error from terser (code it cannot parse) or from a hook emits a PluginError from `@zilero/gulp-js-squeezer` with `fileName` set to the file path.

## Recipes

Drop `console` and `debugger` calls in production:

```ts
jsSqueezer({ terserOptions: { compress: { drop_console: true, drop_debugger: true } } });
```

Keep license comments:

```ts
jsSqueezer({ terserOptions: { format: { comments: /@license|@preserve|^!/ } } });
```

Minify ES modules served as `.js`:

```ts
jsSqueezer({ terserOptions: { module: true } });
```

## Migrating from `gulp-terser` / `gulp-uglify`

| gulp-terser / gulp-uglify                     | @zilero/gulp-js-squeezer                                        |
| --------------------------------------------- | --------------------------------------------------------------- |
| `terser(options)`, `uglify(options)`          | `jsSqueezer({ terserOptions: options })`                        |
| `terser(options, minify)` (a custom minifier) | not supported: terser 5 is the engine                           |
| `gulp-sourcemaps` `init()` / `write('.')`     | `src(…, { sourcemaps: true })` / `dest(…, { sourcemaps: '.' })` |
| `options.sourceMap`                           | removed: the map follows the file                               |
| runs on every file in the stream              | only `.js`, `.mjs`, `.cjs`; other files pass through            |

### From 1.x

- `minifyOptions` is renamed to `terserOptions`.
- The hooks moved from `pluginOptions` to the top level and get `{ content, file }` instead of the content alone.
- Source maps are new: 1.x produced none.
- Only JavaScript files are processed; 1.x ran terser on every file in the stream.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- terser 5 (`^5.51.2`), installed with the plugin

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/js-squeezer)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
