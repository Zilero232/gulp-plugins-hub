# Testing helpers

`@zilero/gulp-plugin-factory/testing` runs a plugin without gulp, for Vitest, Jest or `node:test`.

```ts
import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
```

## `createFile(input?)`

Creates a Vinyl file the way `gulp.src` would.

| Field       | Type                                                | Default      | Description                                                        |
| ----------- | --------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `path`      | `string`                                            | `'file.txt'` | Path relative to `base`.                                           |
| `contents`  | `string \| Buffer \| NodeJS.ReadableStream \| null` | `''`         | A string is stored as UTF-8; `null` makes a file without contents. |
| `cwd`       | `string`                                            | `'/project'` |                                                                    |
| `base`      | `string`                                            | `<cwd>/src`  |                                                                    |
| `sourceMap` | `boolean`                                           | `false`      | Starts an empty map, like `src(…, { sourcemaps: true })`.          |

## `runPlugin(stream, files)`

Writes the files into the stream, ends it and resolves with every file it emitted, in order. Rejects with the first error the stream emits.

```ts
const output = await runPlugin(refilename({ suffix: '.min' }), [createFile({ path: 'app.js' })]);
```

## `getContents(file)`

The Buffer contents of an emitted file. Throws when the file is missing or has no Buffer contents, so tests need no casts or non-null assertions on `contents`.

## `getRelativePath(file)`

The file's path relative to its base with `/` separators, so a test compares the same string on Linux, macOS and Windows:

```ts
expect(output.map(getRelativePath)).toEqual(['js/app.min.js']);
```
