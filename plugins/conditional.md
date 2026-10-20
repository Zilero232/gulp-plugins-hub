---
url: /gulp-plugins-hub/plugins/conditional.md
description: >-
  Route each file of a gulp stream through a different plugin chain by glob,
  RegExp or a function of the file, like if / else if / else for streams.
---

# conditional

Sends each file through the first branch whose condition holds for it, like if / else if / else for streams. A branch is any plugin or chain of plugins; files that no condition matches go to a default branch or pass through untouched.

```sh
npm install --save-dev @zilero/gulp-conditional
```

## Usage

```js
import { dest, src } from 'gulp';
import conditional from '@zilero/gulp-conditional';
import htmlSqueezer from '@zilero/gulp-html-squeezer';
import jsSqueezer from '@zilero/gulp-js-squeezer';

export const build = () =>
  src('src/**')
    .pipe(
      conditional({
        handlers: [
          { condition: '*.js', handler: () => jsSqueezer() },
          { condition: '*.html', handler: () => htmlSqueezer() }
        ]
      })
    )
    .pipe(dest('dist'));
```

A condition is a boolean, a glob, a RegExp, an array of globs and RegExps, or a function that gets `{ file }`; a function may be async:

```js
import conditional from '@zilero/gulp-conditional';
import jsSqueezer from '@zilero/gulp-js-squeezer';
import refilename from '@zilero/gulp-refilename';
import { stat } from 'node:fs/promises';

conditional({
  handlers: [
    // a boolean: in development every file goes here
    { condition: process.env.NODE_ENV !== 'production', handler: () => refilename({ suffix: '.dev' }) },
    // globs and RegExps match file.relative; a glob without a slash matches the name in any folder
    { condition: ['vendor/**', /\.min\.js$/], handler: () => refilename({ suffix: '.vendor' }) },
    // an async function of the file
    { condition: async ({ file }) => (await stat(file.path)).size > 50_000, handler: () => jsSqueezer() }
  ],
  // everything else
  defaultHandler: () => refilename({ suffix: '.min' })
});
```

A handler may return an array of streams. They form a chain: the files go through them in order, and an error from any stream of the chain is emitted.

```js
import conditional from '@zilero/gulp-conditional';
import cssSqueezer from '@zilero/gulp-css-squeezer';
import scssCompiler from '@zilero/gulp-scss-compiler';

conditional({
  handlers: [{ condition: ({ file }) => file.extname === '.scss', handler: () => [scssCompiler(), cssSqueezer()] }]
});
```

Return an array, not `a().pipe(b())`. `.pipe()` returns its argument, so the handler would hand back `b` alone: the files would be written into `b` and skip `a`, and an error from `a` would not reach the task.

## Options

| Option           | Type                       | Default | Description                                                                                                       |
| ---------------- | -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `handlers`       | `{ condition, handler }[]` | none    | Branches, checked in order for every file; the first one whose condition holds gets it. At least one is required. |
| `defaultHandler` | `() => Duplex \| Duplex[]` | none    | Creates the stream, or the chain, for the files no condition matched. Without it they pass through untouched.     |

Each branch in `handlers`:

| Key         | Type                                                                                               | Description                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `condition` | `boolean \| string \| RegExp \| (string \| RegExp)[] \| ({ file }) => boolean \| Promise<boolean>` | `true`, a glob or RegExp that matches `file.relative` (any of an array), or a function that returns `true`, sends the file here. |
| `handler`   | `() => Duplex \| Duplex[]`                                                                         | Creates the stream the matching files go through, or a non-empty array of streams to go through in order.                        |

Unknown keys are an error, and so are an empty `handlers` array (`Add at least one handler`), an empty glob and a condition of any other type (`Expected a boolean, a glob, a RegExp, an array of globs or a function`). Options are checked when the plugin is created.

A handler is checked when its first file arrives. One that returns something other than a stream, or an array with something else in it, emits `handlers[0].handler must return a stream or an array of streams, got undefined` (`defaultHandler …` for the default branch): a handler that forgets `return`, or returns the plugin function instead of calling it, is caught there. An empty array emits `handlers[0].handler returned an empty array; return at least one stream`. Streams are recognized by shape (`write`, `pipe`, `on`), so plugins built on `readable-stream` or `through2` work.

Globs are matched with picomatch against `file.relative` with `/` separators, dotfiles included: a glob without a slash matches the file name in any folder (`'*.js'`), one with a slash matches the whole relative path (`'scripts/**'`). A global or sticky RegExp is reset before every file. Globs and RegExps are compiled once, when the plugin is created.

The package also exports the types `ConditionalOptions`, `ConditionalBranch`, `Condition`, `ConditionFunction`, `PathPattern`, `BranchHandler` and `BranchStream`.

## Notes

* Conditions are checked for every file, in the order of `handlers`; later conditions are not called once one holds.
* Each branch is created once, for the first file that goes to it. A branch that gets no files is never created.
* The stream ends after every branch has finished, so branches that emit files when they end (a concat or a bundle) work.
* Branches run side by side: files from different branches can come out in a different order than they went in.
* A slow branch slows the stream down: files wait until the branch can take more.
* A branch's output is not throttled by the downstream: what it emits is pushed on at once. A branch that emits a very large number of files, or very large ones, can hold them all in memory while a slow downstream catches up.
* A thrown condition fails the task with a `PluginError` named after this plugin.
* An error from a branch is reported on the next file written to the conditional stream, or at the end of the stream, where it is the same `PluginError` whichever way the branch's failure is noticed. A branch that fails while a condition is being awaited fails the stream too, instead of leaving it hanging. A `PluginError` keeps the name of the plugin that threw it, and any other error is wrapped in a `PluginError` named after this plugin when it happens, so it is not attributed to the file processed next.
* When the conditional ends, fails or is destroyed, every branch stream is destroyed with it, so no branch (a Sass compiler, for example) keeps the process alive.
* Every file goes through the conditions, including files without contents and directories.

## Migrating

### From gulp-if

| gulp-if                               | conditional                                                               |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `gulpIf(condition, uglify())`         | `conditional({ handlers: [{ condition, handler: () => jsSqueezer() }] })` |
| `gulpIf(condition, a(), b())` (else)  | `handlers: [{ condition, handler: a }]`, `defaultHandler: b`              |
| nested `gulpIf` for else-if           | more entries in `handlers`, checked in order                              |
| a lazy pipe of plugins for a chain    | return an array: `handler: () => [a(), b()]`                              |
| a glob string, a function of the file | the same; globs match `file.relative`, RegExps and arrays work too        |

The branch is created by a function (`handler: () => plugin()`) rather than passed in, so it only exists once a file needs it, and it is destroyed with the conditional.

### From 1.x

* Conditions are now checked for every file. In 1.x a condition was evaluated once when the plugin was created, and the whole stream went to one handler.
* A condition may be a function of the file (`({ file }) => …`), sync or async, a glob, a RegExp or an array of them, as well as a boolean.
* A handler may return an array of streams to chain.
* Branches are created only when a file goes to them, and files that match nothing pass through when there is no `defaultHandler`.
* Files from different branches may interleave.

See [migrating from 1.x](/guide/migration) for every package.
