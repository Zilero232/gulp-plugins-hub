---
url: /gulp-plugins-hub/guide/writing-plugins.md
description: >-
  Build a typed gulp plugin with @zilero/gulp-plugin-factory: a stream from a
  transform function, validated options, source maps, hooks and tests.
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
    // Other files pass through untouched; extensions are compared in lowercase.
    extensions,
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

## Choosing the files

`extensions: ['.css', '.scss']` limits `transform` to those extensions (compared in lowercase, so `MAIN.CSS` counts); other files pass through untouched. `filter` takes any other test and is checked together with `extensions`. For user-facing include or exclude lists, `createPathMatcher` turns globs and regular expressions into one test of the path relative to the base: a glob without `/` (`*.min.js`) matches the file name in any folder, a glob with `/` (`vendor/**`) matches from the base, and a RegExp tests the path with `/` separators.

```ts
import { createPathMatcher, createPlugin } from '@zilero/gulp-plugin-factory';

const isExcluded = createPathMatcher({ patterns: ['*.min.js', 'vendor/**', /\.generated\./] });

createPlugin({
  name: 'gulp-my-minifier',
  extensions: ['.js', '.mjs'],
  filter: (file) => !isExcluded(file.relative),
  transform: (file) => {
    // only .js and .mjs files that are not excluded get here
  }
});
```

## Cleaning up

A plugin that starts something long-lived (a compiler process, a worker pool) closes it in `dispose`. It runs once whichever way the stream is done: after the last file, on an error, or when the stream is destroyed, where `flush` never runs.

```ts
let compiler: Compiler | undefined;

createPlugin({
  name: 'gulp-my-compiler',
  transform: async (file) => {
    compiler ??= await startCompiler();
    file.contents = Buffer.from(await compiler.compile(file.contents.toString()));
  },
  dispose: () => compiler?.close()
});
```

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

For a tool that cannot take an input map, let `applySourceMap` chain it: `applySourceMap({ file, map, chain: true })`. Only the sources that are the file itself get its map; other sources of the tool's map (an inlined import) stay as they are. To chain several inputs into one map yourself (a bundle), `getChainableSourceMap(file)` gives each file's map with absolute `file://` sources, ready for `@jridgewell/remapping`. Sources that are already URLs (`webpack://…`, `data:…`) are kept; `isUrl(value)` makes the same check.

A plugin that renames or moves a file calls `syncSourceMapFile(file)` afterwards, so `dest(…, { sourcemaps: '.' })` writes the map for the new name:

```ts
transform: (file) => {
  file.stem += '.min';
  syncSourceMapFile(file); // file.sourceMap.file is now 'js/app.min.js'; files without a map are left alone
};
```

## Binary files

Set `binary: true` in plugins for images, fonts or other binary formats. When gulp 5 read the file as UTF-8 (no `src(globs, { encoding: false })`), the file emits an error that tells the user how to fix it, instead of reaching `transform` corrupted. The check is `assertBinaryContents(file)`, exported for plugins that need it elsewhere.

```ts
createPlugin({
  name: 'gulp-my-images',
  extensions: ['.png', '.jpg'],
  binary: true,
  transform: async (file) => {
    file.contents = await optimize(file.contents);
  }
});
```

## Options with any schema library

`parseOptions` takes any synchronous [Standard Schema](https://standardschema.dev): zod 4, valibot, arktype and others. Check callbacks with `isFunction` rather than zod's `z.function()`, which wraps the function and validates its result, and breaks async hooks. `ContentHook` is the type of a hook on a file's text, `FileHookInput` (`{ file }`) the input of a hook on a file, and `isRelativePathInside` checks paths that must stay inside an output folder:

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

## Hooks

Hooks take one object and may return a promise. Run a hook on a file's text with `runContentHook`: without a hook it returns the text as it is, and a hook written in JavaScript that forgets to return the text gets a clear error (`onBeforeWrite must return the text as a string, got undefined`) instead of an obscure one from `Buffer.from`.

```ts
import { runContentHook } from '@zilero/gulp-plugin-factory';

transform: async (file) => {
  const content = await runContentHook({
    name: 'onBeforeWrite',
    hook: onBeforeWrite,
    content: file.contents.toString(),
    file
  });

  file.contents = Buffer.from(content);
};
```

For other hooks, type the input with `FileHookInput` and add what the hook needs: `type CloneInput = FileHookInput & { dir: string }`.

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
