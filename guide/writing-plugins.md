---
url: /gulp-plugins-hub/guide/writing-plugins.md
---
# Writing a plugin

Every plugin in the hub is built with `@zilero/gulp-plugin-factory`. It turns a function that changes one file into a stream that follows the [gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md): files without contents pass through, streamed contents are refused, errors become `PluginError`s with the plugin name and file and are emitted rather than thrown, and files leave in the order they came.

```sh
npm install @zilero/gulp-plugin-factory zod
```

## A banner plugin

```ts
import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

const PLUGIN_NAME = 'gulp-banner';

const optionsSchema = z
  .object({ text: z.string().min(1), extensions: z.array(z.string()).default(['.js', '.css']) })
  .strict();

export type BannerOptions = z.input<typeof optionsSchema>;

export const banner = (options: BannerOptions) => {
  // Checked when the plugin is created: invalid options throw a PluginError listing every problem.
  const { text, extensions } = parseOptions({ name: PLUGIN_NAME, schema: optionsSchema, options });

  return createPlugin({
    name: PLUGIN_NAME,
    // Other files pass through untouched.
    filter: (file) => extensions.includes(file.extname),
    transform: (file) => {
      file.contents = Buffer.concat([Buffer.from(`${text}\n`), file.contents]);
    }
  });
};
```

## What `transform` returns

| Return            | Effect                                                   |
| ----------------- | -------------------------------------------------------- |
| nothing           | The file, changed in place, goes on.                     |
| `null`            | The file is dropped.                                     |
| a file            | That file goes on instead.                               |
| an array of files | Each of them goes on, in order: one input, many outputs. |

`transform` may be async; the next file waits for it. To emit files that do not come from one input (a bundle, a manifest), collect in `transform`, return `null`, and `push` the result from `flush`:

```ts
import { createPlugin, Vinyl } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

export const fileList = () => {
  const names: string[] = [];

  return createPlugin({
    name: 'gulp-file-list',
    transform: (file) => {
      names.push(file.relative);
      return null;
    },
    // A path under the working directory, so `dest('dist')` writes dist/files.txt.
    flush: ({ push }) => push(new Vinyl({ path: path.resolve('files.txt'), contents: Buffer.from(names.join('\n')) }))
  });
};
```

## Files without contents and streams

By default `transform` gets only files with Buffer contents (`accept: 'buffer'`): files without contents pass through and streamed contents emit `Streaming is not supported`. Set `accept: 'any'` to get every file, for plugins that work on paths or handle streams themselves.

## Source maps

When `src(…, { sourcemaps: true })` gave the file a map, pass it to the tool as its input map and store the tool's map:

```ts
import { applySourceMap, createPlugin, getInputSourceMap, toPosixPath } from '@zilero/gulp-plugin-factory';

createPlugin({
  name: 'gulp-my-minifier',
  transform: async (file) => {
    const result = await minify(file.contents.toString(), {
      filename: toPosixPath(file.relative), // `/` on every OS, or Windows maps get backslashes
      sourceMap: Boolean(file.sourceMap),
      inputSourceMap: getInputSourceMap(file) // undefined when there is nothing to chain
    });

    file.contents = Buffer.from(result.code);
    if (file.sourceMap && result.map) applySourceMap({ file, map: result.map });
  }
});
```

For a tool that cannot take an input map, let `applySourceMap` chain it: `applySourceMap({ file, map, chain: true })`. To chain several inputs into one map yourself (a bundle), `getChainableSourceMap(file)` gives each file's map with absolute sources, ready for `@jridgewell/remapping`.

## Binary files

Call `assertBinaryContents(file)` first in plugins for images, fonts or other binary formats: when gulp 5 read the file as UTF-8 (no `encoding: false`), it throws an error that tells the user how to fix it.

## Options with any schema library

`parseOptions` takes any synchronous [Standard Schema](https://standardschema.dev): zod 4, valibot, arktype and others. Check callbacks with `isFunction` rather than zod's `z.function()`, which wraps the function and validates its result, and breaks async hooks. `ContentHook` is the type of a hook on a file's text, and `isRelativePathInside` checks paths that must stay inside an output folder:

```ts
import type { ContentHook } from '@zilero/gulp-plugin-factory';

import { isFunction, isRelativePathInside } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

const optionsSchema = z
  .object({
    name: z.string().refine(isRelativePathInside, 'Expected a path inside the output folder'),
    onBeforeWrite: z.custom<ContentHook>(isFunction, 'Expected a function').optional()
  })
  .strict();
```

## Testing

```ts
import { createFile, getContents, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { expect, it } from 'vitest';

import { banner } from './banner';

it('adds the banner to scripts only', async () => {
  const [script, image] = await runPlugin(banner({ text: '/*! hi */' }), [
    createFile({ path: 'app.js', contents: 'run();' }),
    createFile({ path: 'logo.png', contents: 'png' })
  ]);

  expect(getContents(script).toString()).toBe('/*! hi */\nrun();');
  expect(getContents(image).toString()).toBe('png');
});
```

Compare paths with `getRelativePath(file)`, which uses `/` on every OS, so the tests pass on Windows too.

The full API is in the [factory reference](/reference/factory) and the [testing reference](/reference/testing).
