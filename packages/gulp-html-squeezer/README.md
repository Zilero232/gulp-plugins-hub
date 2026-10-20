# @zilero/gulp-html-squeezer

Minify HTML in a gulp stream with html-minifier-next: presets, inline CSS and JavaScript, hooks before and after.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-html-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-html-squeezer)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-html-squeezer)](https://packagephobia.com/result?p=@zilero/gulp-html-squeezer)
[![node](https://img.shields.io/node/v/@zilero/gulp-html-squeezer?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-html-squeezer?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/html-squeezer)

Minifies `.html` and `.htm` files with [html-minifier-next](https://github.com/j9t/html-minifier-next), the maintained successor of html-minifier-terser, starting from one of its presets. Other files pass through.

Replaces `gulp-htmlmin`.

- Minifies out of the box with the safe `conservative` preset; `comprehensive` also minifies inline CSS, JavaScript and SVG.
- Every html-minifier-next option through `htmlMinifierOptions`, applied over the preset.
- Hooks before and after the minifier, sync or async.
- Typed options, validated when the plugin is created.

## Install

```sh
npm install --save-dev @zilero/gulp-html-squeezer
# pnpm add -D @zilero/gulp-html-squeezer · bun add -d @zilero/gulp-html-squeezer
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { htmlSqueezer } from '@zilero/gulp-html-squeezer';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const html = (): Promise<void> =>
  pipeline(src('src/**/*.html'), htmlSqueezer({ preset: 'comprehensive' }), dest('dist'));
```

In CommonJS: `const { htmlSqueezer } = require('@zilero/gulp-html-squeezer')`.

## Options

| Option                | Type                                               | Default          | Description                                                                                                                                |
| --------------------- | -------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `preset`              | `'conservative' \| 'comprehensive' \| false`       | `'conservative'` | The html-minifier-next preset to start from: `conservative` is safe for any page, `comprehensive` gives the smallest output, `false` none. |
| `htmlMinifierOptions` | `MinifierOptions`                                  | —                | html-minifier-next options as an object, applied over the preset.                                                                          |
| `onBeforeMinify`      | `({ content, file }) => string \| Promise<string>` | —                | Runs on the markup before minification and returns the markup to minify.                                                                   |
| `onAfterMinify`       | `({ content, file }) => string \| Promise<string>` | —                | Runs on the minified markup and returns the final markup.                                                                                  |

Options are validated when the plugin is created: unknown keys, an unknown preset, an `htmlMinifierOptions` that is not an object or a hook that is not a function throw right away.

## Hooks

Both hooks get `{ content, file }`, where `content` is the markup at that step, and return the markup to continue with, or a promise of it. A hook that returns something other than a string fails the file with `onAfterMinify must return the text as a string, got undefined`. The types are exported: `import type { ContentHook } from '@zilero/gulp-html-squeezer'`.

## Source maps

html-minifier-next makes no source maps. A file that arrives with one (`src(…, { sourcemaps: true })`, or a template compiler before) has it removed, since it would point at markup that no longer exists; `dest` then writes no map for it. Changes made in `onAfterMinify` have no map to follow either.

## Files and errors

- `.html` and `.htm` files are minified, extensions compared in lowercase (`INDEX.HTML` too). Other files, and files without contents (`read: false`), pass through untouched. Streamed contents emit an error.
- `.xhtml` passes through as well: the presets drop closing slashes and attribute quotes, which XHTML served as XML does not allow.
- Markup the minifier cannot parse (`<p <b>`) or an error from a hook emits a PluginError from `@zilero/gulp-html-squeezer` with `fileName` set to the file path and the minifier's `Parse error at line …` message.

## Recipes

Smallest output, but keep attribute quotes:

```ts
htmlSqueezer({ preset: 'comprehensive', htmlMinifierOptions: { removeAttributeQuotes: false } });
```

Only what you list, no preset:

```ts
htmlSqueezer({ preset: false, htmlMinifierOptions: { collapseWhitespace: true, removeComments: true } });
```

Right after Pug:

```ts
import { pugCompiler } from '@zilero/gulp-pug-compiler';

export const pages = (): Promise<void> =>
  pipeline(src('src/pages/**/*.pug'), pugCompiler(), htmlSqueezer(), dest('dist'));
```

## Migrating from `gulp-htmlmin`

| gulp-htmlmin                     | @zilero/gulp-html-squeezer                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `htmlmin(options)`               | `htmlSqueezer({ preset: false, htmlMinifierOptions: options })` for the same output |
| `htmlmin()` (barely minifies)    | `htmlSqueezer()`: the `conservative` preset                                         |
| html-minifier options            | html-minifier-next keeps html-minifier's option names                               |
| runs on every file in the stream | only `.html`, `.htm`; other files pass through                                      |

### From 1.x

- html-minifier-terser 7, which is no longer maintained, is replaced by html-minifier-next 9.
- 1.x had no defaults, so without options it barely minified anything. Now the `conservative` preset applies by default; `preset: false` with your own `htmlMinifierOptions` gets the old behavior.
- The hooks moved from `pluginOptions` to the top level and get `{ content, file }` instead of the content alone.
- Only HTML files are processed; 1.x ran the minifier on every file in the stream.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- html-minifier-next 9 (`^9.0.0`), installed with the plugin

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/html-squeezer)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
