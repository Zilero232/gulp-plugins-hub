# @zilero/gulp-plugin-factory

Build typed gulp plugins in a few lines: a stream factory that follows the gulp plugin guidelines, option validation with any Standard Schema, source map and testing helpers.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-plugin-factory?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-plugin-factory)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-plugin-factory)](https://packagephobia.com/result?p=@zilero/gulp-plugin-factory)
[![node](https://img.shields.io/node/v/@zilero/gulp-plugin-factory?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-plugin-factory?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/guide/writing-plugins)

You write what happens to one file; the factory turns it into a stream that follows the [gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md). Every `@zilero/gulp-*` plugin is built with it. Replaces the `through2` + `plugin-error` boilerplate most plugins carry.

- `createPlugin`: files without contents pass through, streams are refused, errors become `PluginError`s with the file, order is kept; `extensions`, `binary` and `dispose` cover the usual chores.
- `parseOptions`: zod 4, valibot, arktype or any synchronous Standard Schema, every problem listed at once.
- Source maps: input maps for tools, storing and chaining their maps, following renames.
- Helpers for hooks, paths and globs, and a `./testing` entry that runs a plugin without gulp.
- ESM, typed, no `any` in the public API.

## Install

```sh
npm install @zilero/gulp-plugin-factory zod
# pnpm add @zilero/gulp-plugin-factory zod · bun add @zilero/gulp-plugin-factory zod
```

A runtime dependency of your plugin (zod, or another schema library, for the options). gulp is not a dependency: neither the factory nor plugins built with it import gulp.

## Quick example

```ts
import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

const schema = z.object({ text: z.string().min(1) }).strict();

export const banner = (options: z.input<typeof schema>) => {
  const { text } = parseOptions({ name: 'gulp-banner', schema, options });

  return createPlugin({
    name: 'gulp-banner',
    extensions: ['.js', '.css'],
    transform: (file) => {
      file.contents = Buffer.concat([Buffer.from(`${text}\n`), file.contents]);
    }
  });
};
```

```ts
// gulpfile.ts
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

import { banner } from './banner';

export const build = (): Promise<void> => pipeline(src('src/**'), banner({ text: '/*! MIT */' }), dest('dist'));
```

In CommonJS: `const { createPlugin } = require('@zilero/gulp-plugin-factory')`.

## API

### `@zilero/gulp-plugin-factory`

| Export                                          | Does                                                                                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createPlugin(definition)`                      | An object-mode Transform stream from a definition (below). Errors are emitted as `PluginError`s, never thrown.                                          |
| `parseOptions({ name, schema, options })`       | Validates options with a synchronous Standard Schema; returns the parsed value or throws a `PluginError` listing every issue.                           |
| `runContentHook({ name, hook, content, file })` | Runs an optional `ContentHook`; returns `content` without one, throws `<name> must return the text as a string, got <type>` on a wrong result.          |
| `applySourceMap({ file, map, chain? })`         | Stores a tool's map as `file.sourceMap` the way `dest` expects it; `chain: true` chains the file's current map in, for tools without input maps.        |
| `getInputSourceMap(file)`                       | The file's map as JSON, to pass to a tool; `undefined` when there is nothing to chain.                                                                  |
| `getChainableSourceMap(file)`                   | The file's map with absolute `file://` sources, ready for `@jridgewell/remapping` (bundles of several files).                                           |
| `syncSourceMapFile(file)`                       | Points `file.sourceMap.file` at the file's current path; call it after renaming or moving a file.                                                       |
| `assertBinaryContents({ relative, contents })`  | Throws with the fix (`src(globs, { encoding: false })`) when binary contents were read as UTF-8. `binary: true` calls it for you.                       |
| `createPathMatcher({ patterns, ignoreCase })`   | One `(relativePath) => boolean` for globs and RegExps: globs without `/` match the name anywhere, globs with `/` from the base, RegExps the posix path. |
| `isRelativePathInside(value)`                   | For schemas: a relative path inside its folder and not the folder itself (`css/a.css` yes; `/x`, `../x`, `.` no).                                       |
| `isUrl(value)`                                  | Whether a path is a URL (`file://`, `webpack://`, `data:`); a Windows drive letter is not.                                                              |
| `toPosixPath(value)`                            | A path with `/` on every OS, for globs, archive entries, manifests and maps.                                                                            |
| `isFunction(value)`                             | For schemas: `z.custom<Hook>(isFunction)` checks a callback without wrapping it (`z.function()` breaks async hooks).                                    |
| `isObject(value)`                               | For schemas: a plain object, not null, an array or a class instance.                                                                                    |
| `toPluginError({ name, error, file? })`         | Wraps anything in a `PluginError` with `fileName`; a `PluginError` is returned as it is.                                                                |
| `PluginError`, `Vinyl`                          | Re-exported from plugin-error and vinyl, as values and types.                                                                                           |

Types: `PluginDefinition`, `BufferPluginDefinition`, `AnyPluginDefinition`, `PluginContext`, `PluginStream`, `TransformResult`, `BufferFile`, `FileHookInput` (`{ file }`), `ContentHookInput` (`{ content, file }`), `ContentHook`, `RunContentHookInput`, `SourceMap`, `ApplySourceMapInput`, `AssertBinaryContentsInput`, `ParseOptionsInput`, `ToPluginErrorInput`.

### `createPlugin` definition

| Field        | Type                                                             | Description                                                                                                |
| ------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`       | `string`                                                         | Prefixes every error; use the package name.                                                                |
| `accept`     | `'buffer' \| 'any'`                                              | `'buffer'` (default): only files with Buffer contents reach `transform`. `'any'`: every file.              |
| `extensions` | `readonly string[]`                                              | Only these extensions (`'.css'`, compared in lowercase) are transformed; others pass through.              |
| `filter`     | `(file: Vinyl) => boolean`                                       | Files it returns false for pass through untouched. Checked with `extensions`.                              |
| `binary`     | `boolean`                                                        | Buffer plugins for binary formats: files read as UTF-8 text emit an error with the fix before `transform`. |
| `transform`  | `(file, context) => TransformResult \| Promise<TransformResult>` | Nothing: the file goes on. `null`: dropped. A file or an array: those go on instead.                       |
| `flush`      | `(context) => void \| Promise<void>`                             | Runs once after the last file; `context.push(file)` emits files (bundles, manifests).                      |
| `dispose`    | `() => void \| Promise<void>`                                    | Runs once when the stream ends, fails or is destroyed: close compilers, workers, watchers.                 |

### `@zilero/gulp-plugin-factory/testing`

| Export                     | Does                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `createFile(input?)`       | A Vinyl file the way `src` makes one: `{ path = 'file.txt', contents = '', cwd = '/project', base = '<cwd>/src', sourceMap = false }`. |
| `runPlugin(stream, files)` | Writes the files, ends the stream, resolves with every emitted file in order; rejects with the first error.                            |
| `getContents(file)`        | The Buffer contents of an emitted file; throws when there are none, so tests need no casts.                                            |
| `getRelativePath(file)`    | The path relative to the base with `/`, so tests compare the same string on every OS.                                                  |
| `CreateFileInput`          | The type of `createFile`'s input.                                                                                                      |

## A full plugin

A JavaScript minifier on terser, with options, an `exclude` list, a hook, source maps and a rename:

```ts
// tiny-terser.ts
import type { ContentHook } from '@zilero/gulp-plugin-factory';

import {
  applySourceMap,
  createPathMatcher,
  createPlugin,
  getInputSourceMap,
  isFunction,
  parseOptions,
  runContentHook,
  syncSourceMapFile,
  toPosixPath
} from '@zilero/gulp-plugin-factory';
import { minify } from 'terser';
import { z } from 'zod';

const PLUGIN_NAME = 'gulp-tiny-terser';

const optionsSchema = z
  .object({
    /** Files left as they are: globs or RegExps, relative to file.base. */
    exclude: z.array(z.union([z.string(), z.instanceof(RegExp)])).default([]),
    /** Add `.min` before the extension. Default true. */
    rename: z.boolean().default(true),
    /** Changes the minified code; append-only changes keep the source map exact. */
    onAfterMinify: z.custom<ContentHook>(isFunction, 'Expected a function').optional()
  })
  .strict();

export type TinyTerserOptions = z.input<typeof optionsSchema>;

export const tinyTerser = (options: TinyTerserOptions = {}) => {
  // Checked once, when the plugin is created: invalid options throw before the build starts.
  const { exclude, rename, onAfterMinify } = parseOptions({ name: PLUGIN_NAME, schema: optionsSchema, options });
  const isExcluded = createPathMatcher({ patterns: exclude });

  return createPlugin({
    name: PLUGIN_NAME,
    extensions: ['.js', '.mjs'],
    filter: (file) => !isExcluded(file.relative),
    transform: async (file) => {
      const result = await minify(
        { [toPosixPath(file.relative)]: file.contents.toString() },
        { sourceMap: file.sourceMap ? { content: getInputSourceMap(file), includeSources: true } : false }
      );

      const code = await runContentHook({
        name: 'onAfterMinify',
        hook: onAfterMinify,
        content: result.code ?? '',
        file
      });

      file.contents = Buffer.from(code);

      if (file.sourceMap && typeof result.map === 'string') {
        applySourceMap({ file, map: result.map });
      }

      if (rename) {
        file.stem += '.min';
        syncSourceMapFile(file);
      }
    }
  });
};
```

Its tests, without gulp:

```ts
// tiny-terser.test.ts
import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { expect, it } from 'vitest';

import { tinyTerser } from './tiny-terser';

it('minifies scripts, renames them and passes other files through', async () => {
  const output = await runPlugin(tinyTerser({ exclude: ['vendor/**'] }), [
    createFile({ path: 'js/app.js', contents: 'const answer = 40 + 2;\nconsole.log(answer);', sourceMap: true }),
    createFile({ path: 'vendor/lib.js', contents: 'const  a = 1;' }),
    createFile({ path: 'style.css', contents: 'a {}' })
  ]);

  expect(output.map(getRelativePath)).toEqual(['js/app.min.js', 'vendor/lib.js', 'style.css']);
  expect(getContents(output[0]).toString()).toBe('const answer=42;console.log(42);');
  expect(output[0]?.sourceMap).toMatchObject({ file: 'js/app.min.js', sources: ['js/app.js'] });
});

it('reports a hook that returns no text', async () => {
  // @ts-expect-error: a JavaScript hook without a return
  const run = runPlugin(tinyTerser({ onAfterMinify: () => {} }), [createFile({ path: 'a.js', contents: 'x()' })]);

  await expect(run).rejects.toThrow('onAfterMinify must return the text as a string, got undefined');
});
```

The [guide](https://zilero232.github.io/gulp-plugins-hub/guide/writing-plugins) walks through the same pieces one at a time: `flush` for many-to-one plugins, `accept: 'any'`, binary formats, `dispose`, chaining maps.

## Requirements

- Node.js 22.13+
- gulp 5 for the plugins you build (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- Any synchronous [Standard Schema](https://standardschema.dev) library for `parseOptions`: zod 4, valibot 1, arktype 2

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/guide/writing-plugins)** · [API reference](https://zilero232.github.io/gulp-plugins-hub/reference/factory) · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
