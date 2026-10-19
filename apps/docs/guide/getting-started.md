# Getting started

gulp-plugins-hub is a set of gulp plugins, each in its own package, that share one way of working: typed options checked when the plugin is created, hooks that get the file, errors that name the plugin and the file.

## Requirements

- Node.js 22.13 or newer
- gulp 5 (gulp 4 works too)

## Install

Install gulp and the plugins the build needs:

```sh
npm install --save-dev gulp @zilero/gulp-scss-compiler @zilero/gulp-css-squeezer @zilero/gulp-js-squeezer
```

## A first gulpfile

```js
// gulpfile.mjs
import { dest, parallel, src } from 'gulp';
import { pipeline } from 'node:stream/promises';
import cssSqueezer from '@zilero/gulp-css-squeezer';
import jsSqueezer from '@zilero/gulp-js-squeezer';
import scssCompiler from '@zilero/gulp-scss-compiler';

export const styles = () =>
  pipeline(
    src('src/styles/*.scss', { sourcemaps: true }),
    scssCompiler(),
    cssSqueezer(),
    dest('dist/css', { sourcemaps: '.' })
  );

export const scripts = () =>
  pipeline(src('src/js/*.js', { sourcemaps: true }), jsSqueezer(), dest('dist/js', { sourcemaps: '.' }));

export default parallel(styles, scripts);
```

Tasks return `pipeline(…)` from `node:stream/promises` rather than a `.pipe()` chain, so an error in any step ends the task with that error ([why](/guide/gulp-5#return-pipeline-not-a-pipe-chain)).

```sh
npx gulp
```

Every plugin is a function that takes its options and returns a stream. Each has a default export and a named one:

```js
import scssCompiler from '@zilero/gulp-scss-compiler';
import { scssCompiler } from '@zilero/gulp-scss-compiler'; // the same function
```

In a CommonJS gulpfile, use the named export:

```js
// gulpfile.js
const { scssCompiler } = require('@zilero/gulp-scss-compiler');
```

## Options are checked up front

Every option is validated when the plugin is created. A wrong value stops the task before any file is read, and lists every problem:

```text
[10:42:01] 'styles' errored after 3 ms
[10:42:01] Error in plugin "@zilero/gulp-css-squeezer"
Message:
    Invalid options:
    • Unrecognized key: "minfy"
```

## Errors name the file

An error while processing a file is a `PluginError` emitted on the stream, with the plugin name and the file:

```text
[10:42:05] Error in plugin "@zilero/gulp-scss-compiler"
Message:
    Undefined variable.
    ╷
  3 │ .card { color: $brand; }
    │                ^^^^^^
    ╵
Details:
    fileName: /project/src/styles/main.scss
```

In a `watch` task an error stops that run; gulp keeps watching.

## Next

- [Gulp 5 essentials](/guide/gulp-5): binary files, glob order, `pipeline`, TypeScript gulpfiles, source maps.
- [Recipes](/guide/recipes): a complete static site build.
- [Plugins](/plugins/): every plugin and its options.
