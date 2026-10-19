---
url: /gulp-plugins-hub/plugins/conditional.md
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
          { condition: ({ file }) => file.extname === '.js', handler: () => jsSqueezer() },
          { condition: ({ file }) => file.extname === '.html', handler: () => htmlSqueezer() }
        ]
      })
    )
    .pipe(dest('dist'));
```

A condition is a boolean or a function that gets `{ file }`, and a function may be async:

```js
import conditional from '@zilero/gulp-conditional';
import jsSqueezer from '@zilero/gulp-js-squeezer';
import refilename from '@zilero/gulp-refilename';
import { stat } from 'node:fs/promises';

conditional({
  handlers: [
    // a boolean: in development every file goes here
    { condition: process.env.NODE_ENV !== 'production', handler: () => refilename({ suffix: '.dev' }) },
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

| Key         | Type                                                   | Description                                                                                               |
| ----------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `condition` | `boolean \| ({ file }) => boolean \| Promise<boolean>` | `true`, or a function that returns `true`, sends the file here.                                           |
| `handler`   | `() => Duplex \| Duplex[]`                             | Creates the stream the matching files go through, or a non-empty array of streams to go through in order. |

Unknown keys are an error, and so are an empty `handlers` array (`Add at least one handler`) and a condition that is neither a boolean nor a function. Options are checked when the plugin is created. A handler that returns an empty array emits an error when its first file arrives (`A handler returned an empty array; return at least one stream`).

The package also exports the types `ConditionalOptions`, `ConditionalBranch`, `Condition`, `BranchHandler` and `BranchStream`.

## Notes

* Conditions are checked for every file, in the order of `handlers`; later conditions are not called once one holds.
* Each branch is created once, for the first file that goes to it. A branch that gets no files is never created.
* The stream ends after every branch has finished, so branches that emit files when they end (a concat or a bundle) work.
* Branches run side by side: files from different branches can come out in a different order than they went in.
* A slow branch slows the stream down: files wait until the branch can take more.
* A branch's output is not throttled by the downstream: what it emits is pushed on at once. A branch that emits a very large number of files, or very large ones, can hold them all in memory while a slow downstream catches up.
* A thrown condition fails the task with a `PluginError` named after this plugin.
* An error from a branch is reported on the next file written to the conditional stream, or at the end of the stream. A branch that fails while a condition is being awaited fails the stream too, instead of leaving it hanging. A `PluginError` keeps the name of the plugin that threw it, and any other error is wrapped in a `PluginError` named after this plugin when it happens, so it is not attributed to the file processed next.
* When the conditional ends, fails or is destroyed, every branch stream is destroyed with it, so no branch (a Sass compiler, for example) keeps the process alive.
* Every file goes through the conditions, including files without contents and directories.

## Migrating from 1.x

* Conditions are now checked for every file. In 1.x a condition was evaluated once when the plugin was created, and the whole stream went to one handler.
* A condition may be a function of the file (`({ file }) => …`), sync or async, as well as a boolean.
* A handler may return an array of streams to chain.
* Branches are created only when a file goes to them, and files that match nothing pass through when there is no `defaultHandler`.
* Files from different branches may interleave.

See [migrating from 1.x](/guide/migration) for every package.
