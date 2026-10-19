---
url: /gulp-plugins-hub/plugins/js-squeezer.md
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

| Option           | Type                                               | Default | Description                                                                                                                 |
| ---------------- | -------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `terserOptions`  | `Omit<MinifyOptions, 'sourceMap'>`                 | `{}`    | Passed to terser's `minify`: `compress`, `mangle`, `format`, `module`, … Not `sourceMap`: the plugin sets it from the file. |
| `onBeforeMinify` | `({ content, file }) => string \| Promise<string>` | —       | Runs on the source before terser and returns the code to minify.                                                            |
| `onAfterMinify`  | `({ content, file }) => string \| Promise<string>` | —       | Runs on terser's output and returns the final code. Source maps do not follow changes made here.                            |

Unknown keys, and a `terserOptions` that is not an object, are an error when the plugin is created.

## Notes

* Only `.js`, `.mjs` and `.cjs` files are minified, in any case. Other files, and files without contents (`read: false`), pass through untouched.
* With `src(…, { sourcemaps: true })`, terser writes a map with the sources included and chains it to the map the file already had (from a bundler or an earlier plugin). `dest(…, { sourcemaps: '.' })` writes it next to the file. Without a map on the file, none is made.
* Source names in the map are relative to `file.base` and use `/` on every OS, Windows included.
* An error from terser or a hook, such as code terser cannot parse, emits a PluginError with the file path.
* The minifier is [terser](https://terser.org); its options go through `terserOptions`, except `sourceMap`. Set `module: true` for ES modules.

## Migrating from 1.x

* `minifyOptions` is renamed to `terserOptions`.
* The hooks moved from `pluginOptions` to the top level and get `{ content, file }` instead of the content alone.
* Source maps are new: 1.x produced none.
* Only JavaScript files are processed; 1.x ran terser on every file in the stream.

See [migrating from 1.x](/guide/migration) for every package.
