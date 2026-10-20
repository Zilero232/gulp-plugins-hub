# @zilero/gulp-conditional

Route each file of a gulp stream through a different plugin chain depending on a condition, like an if / else if / else for streams.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-conditional?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-conditional)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-conditional)](https://packagephobia.com/result?p=@zilero/gulp-conditional)
[![node](https://img.shields.io/node/v/@zilero/gulp-conditional?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-conditional?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/conditional)

Each file goes to the first branch whose condition holds for it; files no condition matches go to a default branch or pass through untouched. A branch is any plugin, or a chain of plugins. Replaces `gulp-if` (and `ternary-stream`).

- As many branches as you need, checked in order: if / else if / else, not only if / else.
- Conditions are booleans, globs, RegExps, arrays of them, or functions of the file (sync or async).
- A branch can be a chain (`() => [scssCompiler(), cssSqueezer()]`), with errors from every link reported.
- Branches are created on their first file and ended with the stream, so concat-like plugins in a branch work.
- No branch outlives the stream: when it ends, fails or is destroyed, every branch is destroyed too.

## Install

```sh
npm install --save-dev @zilero/gulp-conditional
# pnpm add -D @zilero/gulp-conditional · bun add -d @zilero/gulp-conditional
```

gulp is not a dependency: the plugin works with the gulp your project already has.

## Usage

```ts
// gulpfile.ts
import { conditional } from '@zilero/gulp-conditional';
import { cssSqueezer } from '@zilero/gulp-css-squeezer';
import { jsSqueezer } from '@zilero/gulp-js-squeezer';
import { scssCompiler } from '@zilero/gulp-scss-compiler';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const build = (): Promise<void> =>
  pipeline(
    src('src/**', { sourcemaps: true }),
    conditional({
      handlers: [
        { condition: '*.js', handler: () => jsSqueezer() },
        { condition: '*.scss', handler: () => [scssCompiler(), cssSqueezer()] }
      ]
    }),
    dest('dist', { sourcemaps: '.' })
  );
```

In CommonJS: `const { conditional } = require('@zilero/gulp-conditional')`. The default export is the same function.

## Options

| Option           | Type                                                            | Default | Description                                                                                                    |
| ---------------- | --------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `handlers`       | `{ condition: Condition, handler: () => Duplex \| Duplex[] }[]` | —       | Required, at least one. Checked in order for every file; the first branch whose condition holds gets the file. |
| `defaultHandler` | `() => Duplex \| Duplex[]`                                      | —       | Creates the branch for the files no condition matched. Without it they pass through untouched.                 |

A `Condition` is one of:

| Form                                        | The file goes to the branch when                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `boolean`                                   | it is `true` (every file) — `false` sends none.                                              |
| `string` (a glob)                           | it matches `file.relative`. A glob without a slash matches the name in any folder: `'*.js'`. |
| `RegExp`                                    | it matches `file.relative`, with `/` separators.                                             |
| `(string \| RegExp)[]`                      | any of them matches.                                                                         |
| `({ file }) => boolean \| Promise<boolean>` | it returns `true`.                                                                           |

A handler returns a plugin stream, or a non-empty array of them that the files go through in order. Return an array, not `a().pipe(b())`: `.pipe()` returns `b`, so the files would skip `a`.

Options are validated when the plugin is created: unknown keys, an empty `handlers` array (`Add at least one handler`) and a condition of another type are errors.

## Conditions and handlers

- Conditions are checked for every file, in the order of `handlers`; later conditions are not called once one holds. Globs and RegExps are compiled once, when the plugin is created; dotfiles match.
- Each handler is called once, for the first file that goes to its branch. A branch that gets no files is never created.
- The stream ends after every branch has finished, so a branch that emits files when it ends (a concat, an archive) works.
- Branches run side by side: files from different branches can come out in a different order than they went in.
- A slow branch slows the stream down: files wait until the branch can take more. A branch's output is pushed on at once, without waiting for a slow downstream.

## Source maps

Maps travel with the files: a branch plugin that updates `file.sourceMap` does so as it would outside `conditional`.

## Files and errors

- Every file goes through the conditions, including files without contents and directories.
- A condition that throws fails the stream with a `PluginError` from `@zilero/gulp-conditional`.
- A handler that returns something other than a stream fails with `handlers[0].handler must return a stream or an array of streams, got undefined` (or `defaultHandler …`); an empty array with `… returned an empty array; return at least one stream`.
- An error from a branch is reported on the next file written to the stream, or when it ends. A `PluginError` keeps the name of the plugin that threw it; any other error is wrapped in a `PluginError` from this plugin.

## Recipes

Minify only in production:

```ts
conditional({ handlers: [{ condition: process.env.NODE_ENV === 'production', handler: () => jsSqueezer() }] });
```

Images one way, everything else another:

```ts
conditional({
  handlers: [{ condition: /\.(png|jpe?g|webp)$/i, handler: () => imageSqueezer() }],
  defaultHandler: () => textReplace({ rules: { search: '__VERSION__', replace: version } })
});
```

Decide with an async function of the file:

```ts
import { stat } from 'node:fs/promises';

conditional({
  handlers: [{ condition: async ({ file }) => (await stat(file.path)).size > 50_000, handler: () => jsSqueezer() }]
});
```

## Migrating from gulp-if

| gulp-if                               | conditional                                                               |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `gulpIf(condition, uglify())`         | `conditional({ handlers: [{ condition, handler: () => jsSqueezer() }] })` |
| `gulpIf(condition, a(), b())` (else)  | `handlers: [{ condition, handler: a }]`, `defaultHandler: b`              |
| nested `gulpIf` for else-if           | more entries in `handlers`, checked in order                              |
| a lazy pipe of plugins for a chain    | return an array: `handler: () => [a(), b()]`                              |
| a glob string, a function of the file | the same; globs match `file.relative`, RegExps and arrays work too        |

The stream is created by a function (`handler: () => plugin()`), not passed in, so it exists only when a file needs it.

### From 1.x

- Conditions are checked for every file; in 1.x a condition was evaluated once, for the whole stream.
- A condition can be a function of the file (sync or async), a glob, a RegExp or an array of them, as well as a boolean.
- A handler may return an array of streams to chain.
- Branches are created only when a file goes to them, and files that match nothing pass through when there is no `defaultHandler`.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works too)
- ESM with TypeScript types; `require()` works through Node's `require(esm)`
- No engine: Node streams, globs through picomatch (via `@zilero/gulp-plugin-factory`)

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/conditional)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
