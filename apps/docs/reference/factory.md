# Plugin factory

`@zilero/gulp-plugin-factory` — the toolkit every plugin of the hub is built with. A guided tour is in [Writing a plugin](/guide/writing-plugins).

```ts
import {
  applySourceMap,
  assertBinaryContents,
  createPlugin,
  getChainableSourceMap,
  getInputSourceMap,
  isFunction,
  isRelativePathInside,
  parseOptions,
  PluginError,
  toPluginError,
  toPosixPath,
  Vinyl
} from '@zilero/gulp-plugin-factory';
```

## `createPlugin(definition)`

Returns an object-mode `Transform` stream: Vinyl files in, Vinyl files out, one at a time and in order.

| Field       | Type                                                             | Description                                                                                                |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`      | `string`                                                         | Prefixes every error; use the package name.                                                                |
| `accept`    | `'buffer' \| 'any'`                                              | `'buffer'` (default): `transform` gets files with Buffer contents only. `'any'`: every file.               |
| `filter`    | `(file: Vinyl) => boolean`                                       | Files it returns false for pass through untouched, before any other check.                                 |
| `transform` | `(file, context) => TransformResult \| Promise<TransformResult>` | Called for each file. Nothing: the file goes on. `null`: dropped. A file or an array: those go on instead. |
| `flush`     | `(context) => void \| Promise<void>`                             | Runs once after the last file, before the stream ends.                                                     |

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

## `applySourceMap({ file, map, chain? })`

Stores a tool's source map (an object or JSON) as `file.sourceMap`, the way `dest(…, { sourcemaps })` expects it: `file` becomes the file's relative path, absolute or `file://` sources become relative to `file.base`, and every source uses `/`. With `chain: true` the file's current map is chained into the new one first, for tools that cannot take an input map; the new map's only source must be the file itself.

## `getChainableSourceMap(file)`

The file's map with absolute sources (`sourceRoot` applied), ready to chain into another map with `@jridgewell/remapping`; gulp keeps sources relative to `file.base`, while remapping resolves them against the map they are chained into. `undefined` when there is nothing to chain.

## `getInputSourceMap(file)`

The file's current map as JSON, to pass to a tool as its input map. `undefined` when the file has none, or has the empty map `src(…, { sourcemaps: true })` gives files without one: chaining that would leave the output map empty.

## `assertBinaryContents({ relative, contents })`

Throws when binary contents look like they were decoded as UTF-8 (the U+FFFD replacement character in the first 64 bytes), with the fix in the message: `` Read binary files with `src(globs, { encoding: false })` ``.

## `isFunction(value)`

A type guard for option schemas: `z.custom<Hook>(isFunction, 'Expected a function')` checks a callback without wrapping it.

## `isRelativePathInside(value)`

For option schemas: a relative path that stays inside the folder it is relative to and is not that folder. `css/main.css` passes; `/tmp/x`, `../x` and `.` do not.

## `toPosixPath(value)`

A path with `/` separators on every OS, for globs, archive entries, manifests and source maps.

## `toPluginError({ name, error, file? })`

Wraps anything in a `PluginError` prefixed with `name`, with `fileName` from the file; a `PluginError` is returned as it is. `createPlugin` uses it for every error.

## Types

- `ContentHook` — `(input: { content: string; file: Vinyl }) => string | Promise<string>`, the hook on a file's text the plugins share.
- `SourceMap`, `BufferFile`, `PluginDefinition`, `PluginContext`, `TransformResult`, `PluginStream`.

## Re-exports

- `PluginError` — the class from [plugin-error](https://github.com/gulpjs/plugin-error).
- `Vinyl` — the file class from [vinyl](https://github.com/gulpjs/vinyl), and its type: `import type { Vinyl } from '@zilero/gulp-plugin-factory'`.
