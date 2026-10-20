---
url: /gulp-plugins-hub/plugins/js-squeezer.md
description: >-
  Minify JavaScript in a gulp stream with terser, with source maps chained to
  the original sources.
---

# js-squeezer

Minifies JavaScript with terser. When the file has a source map, the new map is chained to it, so the minified code still points to the original sources. Other files pass through.

```sh
npm install --save-dev @zilero/gulp-js-squeezer
```

## Usage

```js
import { dest, src } from 'gulp';
import jsSqueezer from '@zilero/gulp-js-squeezer';

export const scripts = () =>
  src('src/js/**/*.js')
    .pipe(jsSqueezer({ terserOptions: { module: true, compress: { drop_console: true } } }))
    .pipe(dest('dist/js'));
```

With source maps:

```js
export const scripts = () =>
  src('src/js/**/*.js', { sourcemaps: true })
    .pipe(jsSqueezer())
    .pipe(dest('dist/js', { sourcemaps: '.' })); // app.js and app.js.map
```

## Options

| Option           | Type                                               | Default | Description                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `terserOptions`  | `Omit<MinifyOptions, 'sourceMap'>`                 | `{}`    | Passed to terser's `minify`: `compress`, `mangle`, `format`, `module`, … Not `sourceMap`: the plugin sets it from the file. Without `module`, `.mjs` files are minified as ES modules and `.js`, `.cjs` as scripts. |
| `onBeforeMinify` | `({ content, file }) => string \| Promise<string>` | —       | Runs on the source before terser and returns the code to minify.                                                                                                                                                    |
| `onAfterMinify`  | `({ content, file }) => string \| Promise<string>` | —       | Runs on terser's output and returns the final code. The source map does not follow changes made here.                                                                                                               |

Unknown keys, and a `terserOptions` that is not an object, are an error when the plugin is created.

## Hooks

Both hooks get `{ content, file }` and return the text to continue with, or a promise of it. A hook that returns anything else, say a JavaScript hook that forgets its `return`, fails the file with `onAfterMinify must return the text as a string, got undefined`. Their types are exported from the package: `import type { ContentHook } from '@zilero/gulp-js-squeezer'`.

The source map describes terser's output, so changes made in `onAfterMinify` are not followed by it: a banner added there shifts every line the map points at. Use terser's `format: { preamble: '/* banner */' }` instead, which the map accounts for.

## Notes

* Only `.js`, `.mjs` and `.cjs` files are minified, in any case. Other files, and files without contents (`read: false`), pass through untouched.
* With `src(…, { sourcemaps: true })`, terser writes a map with the sources included and chains it to the map the file already had (from a bundler or an earlier plugin). `dest(…, { sourcemaps: '.' })` writes it next to the file. Without a map on the file, none is made.
* Source names in the map are relative to `file.base` and use `/` on every OS, Windows included.
* An error from terser or a hook, such as code terser cannot parse, emits a PluginError with the file path.
* `module` follows the extension unless `terserOptions.module` is set: `.mjs` is minified as an ES module (strict mode, top-level names mangled and unused ones dropped), `.cjs` and `.js` as scripts, terser's default. Set `module: true` for ES modules served as `.js`.
* When terser returns no code, the file fails with a PluginError instead of being written empty.
* The minifier is [terser](https://terser.org); its options go through `terserOptions`, except `sourceMap`.

## Migrating

### From gulp-terser or gulp-uglify

| gulp-terser / gulp-uglify                     | js-squeezer                                                     |
| --------------------------------------------- | --------------------------------------------------------------- |
| `terser(options)`, `uglify(options)`          | `jsSqueezer({ terserOptions: options })`                        |
| `terser(options, minify)` (a custom minifier) | not supported: terser 5 is the engine                           |
| gulp-sourcemaps `init()` / `write('.')`       | `src(…, { sourcemaps: true })` / `dest(…, { sourcemaps: '.' })` |
| `sourceMap` in the options                    | removed: the map follows the file                               |
| runs on every file in the stream              | only `.js`, `.mjs` and `.cjs`; other files pass through         |

### From 1.x

* `minifyOptions` is renamed to `terserOptions`.
* The hooks moved from `pluginOptions` to the top level and get `{ content, file }` instead of the content alone.
* Source maps are new: 1.x produced none.
* Only JavaScript files are processed; 1.x ran terser on every file in the stream.

See [migrating from 1.x](/guide/migration) for every package.
