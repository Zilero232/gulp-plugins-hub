---
url: /gulp-plugins-hub/guide/troubleshooting.md
description: >-
  Fixes for the problems gulp 5 builds run into with gulp-plugins-hub -
  corrupted binary files, CommonJS and TypeScript gulpfiles, native binaries in
  CI and Windows paths.
---

# Troubleshooting

## Images, fonts or archives come out corrupted

Gulp 5 reads every file as UTF-8 text unless told otherwise, and every byte that is not valid UTF-8 becomes `U+FFFD`. [image-squeezer](/plugins/image-squeezer) and [font-switcher](/plugins/font-switcher) notice and fail with the fix:

```text
Error in plugin "@zilero/gulp-image-squeezer"
Message:
    images/hero.jpg was read as UTF-8 text and is corrupted. Read binary files with `src(globs, { encoding: false })`
```

Read binary files with `encoding: false`:

```js
src('src/images/**', { encoding: false });
```

Plugins that only copy, rename or pack files ([archive-creator](/plugins/archive-creator), [asset-revision](/plugins/asset-revision), [folder-clone](/plugins/folder-clone), [refilename](/plugins/refilename)) cannot tell a corrupted file from a good one: give them `encoding: false` too whenever the stream has binary files. Text plugins work with either; [text-replace](/plugins/text-replace) leaves files with a NUL byte alone.

## `require()` of the plugins in a CommonJS gulpfile

The packages are ES modules. Node.js 22.12 and newer load them with `require`, through the named export:

```js
// gulpfile.js (CommonJS)
const { scssCompiler } = require('@zilero/gulp-scss-compiler');
```

* `scssCompiler is not a function`: `require` returns the module namespace, so the default export is `require(…).default`. Use the named export.
* `ERR_REQUIRE_ESM`: the Node.js version is older than 22.12. The packages need 22.13 or newer.
* On some 22.x releases Node.js prints an `ExperimentalWarning` for `require()` of an ES module. It is harmless; moving the gulpfile to ES modules (`gulpfile.mjs`, or `"type": "module"`) removes it.

## A TypeScript gulpfile does not load

gulp-cli loads `gulpfile.ts` through a register module, tried in a fixed order: ts-node, sucrase, @babel/register, esbuild-register, @swc/register. Node's built-in type stripping is not registered for `require`, which gulp-cli uses, so it does not help here.

* `Failed to load external module …` for each of them: none is installed. Install `esbuild-register` and `esbuild`.
* The gulpfile fails to load with `"type": "module"` although esbuild-register is installed, and the log says `Loaded external module: sucrase/register/ts`: sucrase is picked before esbuild-register, and it does not handle ES modules. `npm ls sucrase` shows what brings it in; remove it.
* `Top-level await is currently not supported with the "cjs" output format`: the register modules compile the gulpfile to CommonJS. Move the `await` into a task.

[Gulp 5 essentials](/guide/gulp-5#es-modules-and-typescript-gulpfiles) has the setup; the [example project](/guide/example-project) uses it.

## Native binaries missing in CI or Docker

[image-squeezer](/plugins/image-squeezer) (sharp), [scss-compiler](/plugins/scss-compiler) (sass-embedded) and [css-squeezer](/plugins/css-squeezer) (Lightning CSS) ship a prebuilt binary per platform as an optional dependency, such as `@img/sharp-linux-x64`, `sass-embedded-linux-x64` or `lightningcss-linux-x64-gnu`. The package manager installs only the one for the machine it runs on. Errors like `Could not load the "sharp" module using the linux-x64 runtime` or `Cannot find module 'lightningcss-linux-x64-gnu'` mean that binary is missing:

* Install on the machine (or in the image) that runs the build. A `node_modules` copied from macOS or Windows into a Linux container has the wrong binaries.
* Do not skip optional dependencies: no `--omit=optional`, `--no-optional` or `optional=false` in `.npmrc`.
* Alpine and other musl images need the `musl` builds; they install when `npm install` runs inside that image.
* With npm, a lockfile written on one platform can miss the optional packages of another. Run `npm install` once more on the CI platform, or install them explicitly: `npm install --os=linux --cpu=x64 sharp`. Bun and pnpm keep every platform in the lockfile.

font-switcher uses WebAssembly, so it has no native binary.

## Paths on Windows

`file.relative` and `file.path` use the platform's separator, so on Windows they contain `\`. Globs and regular expressions in plugin options are matched against the path with `/` on every platform: write `'images/**/*.png'` or `/^images\//` and they work everywhere.

In your own hooks and conditions, compare paths the same way:

```js
import path from 'node:path';

const relative = file.relative.split(path.sep).join('/');
```

Names the plugins write into files (archive entries, the asset-revision manifest, source map sources, error messages) always use `/`.

## A task hangs at "Starting…"

A stream in the middle of a `.pipe()` chain failed, and gulp never heard the task end. Return `pipeline(…)` from `node:stream/promises` instead: the task then ends with the error ([why](/guide/gulp-5#return-pipeline-not-a-pipe-chain)).

## `Invalid options` before any file is read

Every plugin validates its options when it is created and lists every problem:

```text
Error in plugin "@zilero/gulp-css-squeezer"
Message:
    Invalid options:
    • Unrecognized key: "minfy"
```

Unknown keys are errors, so a typo or an option name from another plugin shows up here instead of being ignored. The plugin's page lists its options, and [Migrating from other plugins](/guide/migrating-from-other-plugins) maps the common ones.
