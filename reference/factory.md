---
url: /gulp-plugins-hub/reference/factory.md
description: >-
  API reference of @zilero/gulp-plugin-factory: createPlugin, parseOptions,
  hooks, source map, path and binary helpers.
---

# Plugin factory

`@zilero/gulp-plugin-factory` — the toolkit every plugin of the hub is built with. A guided tour is in [Writing a plugin](/guide/writing-plugins).

```ts
import {
  applySourceMap,
  assertBinaryContents,
  createPathMatcher,
  createPlugin,
  getChainableSourceMap,
  getInputSourceMap,
  isFunction,
  isObject,
  isRelativePathInside,
  isUrl,
  parseOptions,
  PluginError,
  runContentHook,
  syncSourceMapFile,
  toPluginError,
  toPosixPath,
  Vinyl
} from '@zilero/gulp-plugin-factory';
```

## `createPlugin(definition)`

Returns an object-mode `Transform` stream: Vinyl files in, Vinyl files out, one at a time and in order.

| Field        | Type                                                             | Description                                                                                                     |
| ------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `name`       | `string`                                                         | Prefixes every error; use the package name.                                                                     |
| `accept`     | `'buffer' \| 'any'`                                              | `'buffer'` (default): `transform` gets files with Buffer contents only. `'any'`: every file.                    |
| `extensions` | `readonly string[]`                                              | Only files with one of these extensions (`'.css'`, compared in lowercase) are transformed; others pass through. |
| `filter`     | `(file: Vinyl) => boolean`                                       | Files it returns false for pass through untouched, before any other check. Checked together with `extensions`.  |
| `binary`     | `boolean`                                                        | `accept: 'buffer'` only: files read as UTF-8 text emit the `assertBinaryContents` error before `transform`.     |
| `transform`  | `(file, context) => TransformResult \| Promise<TransformResult>` | Called for each file. Nothing: the file goes on. `null`: dropped. A file or an array: those go on instead.      |
| `flush`      | `(context) => void \| Promise<void>`                             | Runs once after the last file, before the stream ends.                                                          |
| `dispose`    | `() => void \| Promise<void>`                                    | Runs once when the stream is done: ended, failed or destroyed. Closes what the plugin opened.                   |

`context` is `{ name, push }`: `push(file)` sends a file downstream from `transform` or `flush`.

A `filter` that throws is reported like any other error. With `accept: 'buffer'`, a file without contents passes through and a file with streamed contents emits `Streaming is not supported`. Anything `transform` or `flush` throws or rejects with is emitted as a `PluginError` with the plugin name and the file path (`fileName`); a `PluginError` is emitted as it is.

Types: `PluginDefinition`, `BufferPluginDefinition`, `AnyPluginDefinition`, `PluginContext`, `TransformResult`, `BufferFile` (a Vinyl file whose `contents` is a `Buffer`), `PluginStream`.

## `parseOptions({ name, schema, options })`

Validates `options` against a synchronous [Standard Schema](https://standardschema.dev) (zod 4, valibot, arktype, …) and returns the parsed value, defaults applied. Invalid options throw a `PluginError`:

```text
Invalid options:
    • quality: Too big: expected number to be <=100
    • Unrecognized key: "qualty"
```

An asynchronous schema throws `The options schema must be synchronous`.

## `runContentHook({ name, hook, content, file })`

Runs an optional `ContentHook` and resolves with the text it returns; without a hook, resolves with `content`. A result that is not a string throws `<name> must return the text as a string, got <type>` (`name` is the option name, such as `'onAfterMinify'`), where a JavaScript hook that forgot to return would otherwise end as an obscure `Buffer.from(undefined)` error.

## `applySourceMap({ file, map, chain? })`

Stores a tool's source map (an object or JSON) as `file.sourceMap`, the way `dest(…, { sourcemaps })` expects it: `file` becomes the file's relative path, absolute or `file://` sources become relative to `file.base`, and every source uses `/`. With `chain: true` the file's current map is chained into the new one first, for tools that cannot take an input map. Only the sources that are the file itself get its map; other sources (an inlined import) stay as they are.

## `syncSourceMapFile(file)`

Sets `file.sourceMap.file` to the file's current relative path, with `/`. Call it after renaming or moving a file, so `dest` writes the map for the new name. Files without a map are left alone.

## `getChainableSourceMap(file)`

The file's map with absolute sources as `file://` URLs (`sourceRoot` applied; sources that are already URLs are kept), ready to chain into another map with `@jridgewell/remapping`; gulp keeps sources relative to `file.base`, while remapping resolves them against the map they are chained into. `undefined` when there is nothing to chain.

## `getInputSourceMap(file)`

The file's current map as JSON, to pass to a tool as its input map. `undefined` when the file has none, or has the empty map `src(…, { sourcemaps: true })` gives files without one: chaining that would leave the output map empty.

## `assertBinaryContents({ relative, contents })`

Throws when binary contents look like they were decoded as UTF-8 (the U+FFFD replacement character in the first 64 bytes), with the fix in the message: `` Read binary files with `src(globs, { encoding: false })` ``. `createPlugin({ binary: true })` calls it before `transform`.

## `createPathMatcher({ patterns, ignoreCase })`

Takes `patterns`, a `(string | RegExp)[]`, and returns `(relativePath: string) => boolean`, one test for every pattern. Globs go through picomatch with dotfiles included: a glob without `/` (`*.map`) matches the file name in any folder, a glob with `/` (`vendor/**`) matches from the base. A RegExp tests the path with `/` separators, from the start every time even when it is global or sticky. An empty list matches nothing. `ignoreCase: true` makes globs ignore case (`*.png` matches `LOGO.PNG`); regular expressions keep their own flags.

## `isFunction(value)`

A type guard for option schemas: `z.custom<Hook>(isFunction, 'Expected a function')` checks a callback without wrapping it.

## `isObject(value)`

A type guard for option schemas: a plain object, not `null`, an array or a class instance.

## `isRelativePathInside(value)`

For option schemas: a relative path that stays inside the folder it is relative to and is not that folder. `css/main.css` passes; `/tmp/x`, `../x` and `.` do not.

## `isUrl(value)`

Whether a path is a URL (`file://…`, `webpack://…`, `data:…`) rather than a file path. A Windows drive letter (`C:\x`) is not a URL.

## `toPosixPath(value)`

A path with `/` separators on every OS, for globs, archive entries, manifests and source maps.

## `toPluginError({ name, error, file? })`

Wraps anything in a `PluginError` prefixed with `name`, with `fileName` from the file; a `PluginError` is returned as it is. `createPlugin` uses it for every error.

## Types

* `FileHookInput` — `{ file: Vinyl }`, what a hook on a file receives; extend it for hooks with more keys.
* `ContentHookInput` — `FileHookInput & { content: string }`.
* `ContentHook` — `(input: ContentHookInput) => string | Promise<string>`, the hook on a file's text the plugins share.
* `RunContentHookInput`, `ApplySourceMapInput`, `AssertBinaryContentsInput`, `ParseOptionsInput`, `ToPluginErrorInput` — the inputs of the functions above.
* `SourceMap`, `BufferFile`, `PluginDefinition`, `BufferPluginDefinition`, `AnyPluginDefinition`, `PluginContext`, `TransformResult`, `PluginStream`.

## Re-exports

* `PluginError` — the class from [plugin-error](https://github.com/gulpjs/plugin-error).
* `Vinyl` — the file class from [vinyl](https://github.com/gulpjs/vinyl), and its type: `import type { Vinyl } from '@zilero/gulp-plugin-factory'`.
