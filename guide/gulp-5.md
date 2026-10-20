---
url: /gulp-plugins-hub/guide/gulp-5.md
description: >-
  The gulp 5 changes every build runs into: binary files and encoding false,
  glob order, source maps, pipeline, ES modules and TypeScript gulpfiles.
---

# Gulp 5 essentials

Gulp 5 changed a few defaults that every build runs into. The plugins handle them, but some need a setting in your gulpfile.

## Binary files need `encoding: false`

Gulp 5 reads every file as UTF-8 text. Images, fonts and other binary files come out corrupted: every byte that is not valid UTF-8 becomes `U+FFFD`. Read them with `encoding: false`:

```js
src('src/images/**', { encoding: false });
src('src/fonts/*.ttf', { encoding: false });
```

[image-squeezer](/plugins/image-squeezer) and [font-switcher](/plugins/font-switcher) recognize a file read as text and fail with this fix in the message, instead of a decoder error. Plugins that only copy or pack files ([archive-creator](/plugins/archive-creator), [folder-clone](/plugins/folder-clone), [asset-revision](/plugins/asset-revision)) cannot tell: read binary files with `encoding: false` there too, or the copies are corrupted.

## Glob order is not kept

Gulp 4 emitted the files of `src(['a/*.js', 'b/*.js'])` in the order of the globs. Gulp 5 does not. When order matters, set it in the plugin:

```js
src('src/js/**/*.js').pipe(fileConcat({ name: 'app.js', order: ['vendor/**', 'lib/**'] }));
```

## Source maps without gulp-sourcemaps

`src` and `dest` handle source maps themselves:

```js
src('src/**/*.scss', { sourcemaps: true }) // reads existing maps, starts empty ones
  .pipe(scssCompiler())
  .pipe(cssSqueezer())
  .pipe(dest('dist', { sourcemaps: '.' })); // writes main.css.map next to main.css
```

[scss-compiler](/plugins/scss-compiler), [css-squeezer](/plugins/css-squeezer), [js-squeezer](/plugins/js-squeezer) and [file-concat](/plugins/file-concat) produce a map when the file has one, chained to the map before them where the tool supports it. Without `sourcemaps: true` they make none.

## Return `pipeline()`, not a `.pipe()` chain

When a stream in the middle of a `.pipe()` chain fails, gulp never hears the task end: it hangs at "Starting…" and a watcher stops running it. `pipeline` from `node:stream/promises` ends the task with the error:

```js
import { pipeline } from 'node:stream/promises';

export const styles = () => pipeline(src('src/scss/*.scss'), scssCompiler(), cssSqueezer(), dest('dist/css'));
```

In a dev task, start the watchers without returning them: a failing task is then reported and the next change runs it again, instead of the error ending the whole dev task.

```js
export const serve = (done) => {
  watch('src/scss/**', styles);
  done();
};
```

## ES modules and TypeScript gulpfiles

The packages are ES modules. Use them from:

* `gulpfile.mjs`, or `gulpfile.js` with `"type": "module"` in package.json: `import`.
* a CommonJS `gulpfile.js`: `const { cssSqueezer } = require('@zilero/gulp-css-squeezer')` (Node.js 22.12+ loads ES modules with `require`).
* `gulpfile.ts`. gulp-cli loads it through a register module it looks for in a fixed order: ts-node, sucrase, @babel/register, esbuild-register, @swc/register. Node's own TypeScript support is not registered for `require`, so without one of them gulp-cli prints an error for each before falling back. Install esbuild-register:

```sh
npm install --save-dev esbuild-register esbuild
```

It compiles the gulpfile and the files it imports on the fly, ES modules included (`"type": "module"`), on every supported Node.js. sucrase does not work with `"type": "module"`, and gulp-cli picks it before esbuild-register when it is installed. The compiled code runs as CommonJS, so top-level `await` is not available in the gulpfile.

The plugins ship their types, and `Vinyl` (the file type hooks receive) is exported by `@zilero/gulp-plugin-factory`.

## Files without contents and streams

`src(…, { read: false })` and directories give files without contents. The plugins pass them through untouched, except the ones that work on paths ([refilename](/plugins/refilename), [file-exclude](/plugins/file-exclude), [conditional](/plugins/conditional), [folder-clone](/plugins/folder-clone), [file-changed](/plugins/file-changed)).

`src(…, { buffer: false })` gives streamed contents. Only [archive-creator](/plugins/archive-creator) accepts them; the others emit `Streaming is not supported`.
