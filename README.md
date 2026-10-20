<h1 align="center">gulp-plugins-hub</h1>

<p align="center">
  <b>Typed plugins for gulp 5.</b><br>
  Pug, Sass, Lightning CSS, terser, sharp, fonts, archives and cache-busting: one API, options checked up front, errors that name the file.
</p>

<p align="center">
  <a href="https://github.com/Zilero232/gulp-plugins-hub/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Zilero232/gulp-plugins-hub/ci.yml?label=CI&logo=github" alt="CI"></a>
  <a href="https://www.npmjs.com/org/zilero"><img src="https://img.shields.io/badge/npm-%40zilero-7c3aed?logo=npm" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Zilero232/gulp-plugins-hub?color=7c3aed" alt="license"></a>
  <a href="https://zilero232.github.io/gulp-plugins-hub/"><img src="https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white" alt="docs"></a>
</p>

## Quick start

```sh
npm install --save-dev gulp esbuild-register esbuild @zilero/gulp-scss-compiler @zilero/gulp-css-squeezer
```

```ts
// gulpfile.ts
import cssSqueezer from '@zilero/gulp-css-squeezer';
import scssCompiler from '@zilero/gulp-scss-compiler';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const styles = (): Promise<void> =>
  pipeline(
    src('src/scss/*.scss', { sourcemaps: true }),
    scssCompiler(),
    cssSqueezer(),
    dest('dist/css', { sourcemaps: '.' })
  );

export default styles;
```

```sh
npx gulp
```

gulp-cli loads `gulpfile.ts` through esbuild-register; a `gulpfile.mjs` with the same code minus the types needs neither. In a CommonJS gulpfile, `const { scssCompiler } = require('@zilero/gulp-scss-compiler')`. More in [Getting started](https://zilero232.github.io/gulp-plugins-hub/guide/getting-started).

## Packages

Every package is published as `@zilero/gulp-<name>`, and all of them share one version.

### Compile

| Package                                                                                            | Version                                                                                                                                         | Replaces  | What it does                                                                     |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| [`@zilero/gulp-pug-compiler`](https://zilero232.github.io/gulp-plugins-hub/plugins/pug-compiler)   | [![npm](https://img.shields.io/npm/v/@zilero/gulp-pug-compiler?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-pug-compiler)   | gulp-pug  | Pug templates to HTML, with data per file; partials skipped.                     |
| [`@zilero/gulp-scss-compiler`](https://zilero232.github.io/gulp-plugins-hub/plugins/scss-compiler) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-scss-compiler?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-scss-compiler) | gulp-sass | SCSS and indented Sass with sass-embedded, one compiler per stream, source maps. |

### Minify

| Package                                                                                            | Version                                                                                                                                         | Replaces                          | What it does                                                                          |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| [`@zilero/gulp-html-squeezer`](https://zilero232.github.io/gulp-plugins-hub/plugins/html-squeezer) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-html-squeezer?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-html-squeezer) | gulp-htmlmin                      | HTML with html-minifier-next presets, inline CSS and JavaScript included.             |
| [`@zilero/gulp-css-squeezer`](https://zilero232.github.io/gulp-plugins-hub/plugins/css-squeezer)   | [![npm](https://img.shields.io/npm/v/@zilero/gulp-css-squeezer?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-css-squeezer)   | gulp-clean-css, gulp-autoprefixer | Minifies, prefixes and lowers syntax for your browserslist in one Lightning CSS pass. |
| [`@zilero/gulp-js-squeezer`](https://zilero232.github.io/gulp-plugins-hub/plugins/js-squeezer)     | [![npm](https://img.shields.io/npm/v/@zilero/gulp-js-squeezer?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-js-squeezer)     | gulp-terser, gulp-uglify          | JavaScript with terser, source maps chained.                                          |

### Assets

| Package                                                                                                | Version                                                                                                                                             | Replaces                                  | What it does                                                                                            |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`@zilero/gulp-image-squeezer`](https://zilero232.github.io/gulp-plugins-hub/plugins/image-squeezer)   | [![npm](https://img.shields.io/npm/v/@zilero/gulp-image-squeezer?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-image-squeezer)   | gulp-imagemin, gulp-webp, gulp-responsive | Optimizes images with sharp, converts them to WebP and AVIF, resizes them for `srcset`.                 |
| [`@zilero/gulp-font-switcher`](https://zilero232.github.io/gulp-plugins-hub/plugins/font-switcher)     | [![npm](https://img.shields.io/npm/v/@zilero/gulp-font-switcher?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-font-switcher)     | gulp-ttf2woff2, gulp-fonter               | Fonts to woff2, woff, ttf, eot and svg, several at once, with subsetting; WebAssembly, no native build. |
| [`@zilero/gulp-asset-revision`](https://zilero232.github.io/gulp-plugins-hub/plugins/asset-revision)   | [![npm](https://img.shields.io/npm/v/@zilero/gulp-asset-revision?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-asset-revision)   | gulp-rev, gulp-rev-rewrite                | Content hashes in asset names, the references rewritten and a manifest, in one pass.                    |
| [`@zilero/gulp-archive-creator`](https://zilero232.github.io/gulp-plugins-hub/plugins/archive-creator) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-archive-creator?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-archive-creator) | gulp-zip, gulp-tar                        | Packs the files of the stream into a zip, tar or tar.gz archive.                                        |

### Stream control

| Package                                                                                          | Version                                                                                                                                       | Replaces                  | What it does                                                                                     |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| [`@zilero/gulp-conditional`](https://zilero232.github.io/gulp-plugins-hub/plugins/conditional)   | [![npm](https://img.shields.io/npm/v/@zilero/gulp-conditional?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-conditional)   | gulp-if                   | Sends each file through the first branch whose condition holds for it.                           |
| [`@zilero/gulp-file-exclude`](https://zilero232.github.io/gulp-plugins-hub/plugins/file-exclude) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-file-exclude?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-file-exclude) | gulp-filter               | Drops files by glob, regular expression, size or your own predicate.                             |
| [`@zilero/gulp-file-changed`](https://zilero232.github.io/gulp-plugins-hub/plugins/file-changed) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-file-changed?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-file-changed) | gulp-newer, gulp-changed  | Lets through only the files that changed since the last build.                                   |
| [`@zilero/gulp-folder-clone`](https://zilero232.github.io/gulp-plugins-hub/plugins/folder-clone) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-folder-clone?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-folder-clone) | —                         | Copies every file into extra folders in one pass, with a hook per copy.                          |
| [`@zilero/gulp-file-concat`](https://zilero232.github.io/gulp-plugins-hub/plugins/file-concat)   | [![npm](https://img.shields.io/npm/v/@zilero/gulp-file-concat?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-file-concat)   | gulp-concat               | Joins files in the order you set, with a header, a footer and a source map.                      |
| [`@zilero/gulp-text-replace`](https://zilero232.github.io/gulp-plugins-hub/plugins/text-replace) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-text-replace?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-text-replace) | gulp-replace, gulp-header | Replaces text with strings, regular expressions or async functions; adds a banner or footer.     |
| [`@zilero/gulp-refilename`](https://zilero232.github.io/gulp-plugins-hub/plugins/refilename)     | [![npm](https://img.shields.io/npm/v/@zilero/gulp-refilename?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-refilename)     | gulp-rename               | Renames files: a new name, prefix, suffix, extension or folder, or a function of the path parts. |

### Authoring

| Package                                                                                         | Version                                                                                                                                           | Replaces                      | What it does                                                                              |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| [`@zilero/gulp-plugin-factory`](https://zilero232.github.io/gulp-plugins-hub/reference/factory) | [![npm](https://img.shields.io/npm/v/@zilero/gulp-plugin-factory?label=&color=7c3aed)](https://www.npmjs.com/package/@zilero/gulp-plugin-factory) | hand-written through2 streams | `createPlugin`, `parseOptions`, source map, path and binary helpers, and testing helpers. |

## Why these plugins

- **Built for gulp 5.** ES modules with types, source maps through `src` and `dest`'s own `sourcemaps` option, and binary plugins that recognize a file gulp 5 read as UTF-8 text and tell you to add `encoding: false`.
- **Options checked when the plugin is created.** A typo or a wrong type fails with a list of every problem, not with a build that silently does nothing.
- **Follows the gulp guidelines.** Files without contents and files of other types pass through, errors are `PluginError`s with the plugin name and the file, and gulp is never a dependency.
- **Maintained engines.** Lightning CSS, html-minifier-next, sass-embedded, terser, sharp and harfbuzz instead of the unmaintained ones many gulp plugins still wrap.
- **Hooks that see the file.** Every hook gets the Vinyl file and may be async, so one plugin can treat files differently.

## Requirements and compatibility

- **Node.js 22.13 or newer.** ES modules; a CommonJS gulpfile loads them with `require()`.
- **gulp 5**; gulp 4 works too. gulp is not a dependency of any package.
- **Linux, macOS and Windows**: CI runs every package's tests and the example build on all three (Node.js 24), plus Node.js 22.13 and 26 on Linux.
- sharp, sass-embedded and Lightning CSS install a prebuilt binary for the platform; [Troubleshooting](https://zilero232.github.io/gulp-plugins-hub/guide/troubleshooting#native-binaries-missing-in-ci-or-docker) covers CI and Docker.

## Documentation

| Page                                                                                                            | What is there                                                                      |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Getting started](https://zilero232.github.io/gulp-plugins-hub/guide/getting-started)                           | Install, a first gulpfile, how options and errors work                             |
| [Gulp 5 essentials](https://zilero232.github.io/gulp-plugins-hub/guide/gulp-5)                                  | `encoding: false`, glob order, source maps, `pipeline`, TypeScript gulpfiles       |
| [Recipes](https://zilero232.github.io/gulp-plugins-hub/guide/recipes)                                           | Incremental builds, responsive images, font subsets                                |
| [Example project](https://zilero232.github.io/gulp-plugins-hub/guide/example-project)                           | A complete site build, task by task                                                |
| [Migrating from other plugins](https://zilero232.github.io/gulp-plugins-hub/guide/migrating-from-other-plugins) | gulp-sass, gulp-imagemin, gulp-rev and the rest, option by option                  |
| [Migrating from 1.x](https://zilero232.github.io/gulp-plugins-hub/guide/migration)                              | What changed in 2.0                                                                |
| [Troubleshooting](https://zilero232.github.io/gulp-plugins-hub/guide/troubleshooting)                           | Corrupted files, CommonJS and TypeScript gulpfiles, native binaries, Windows paths |
| [Plugins](https://zilero232.github.io/gulp-plugins-hub/plugins/)                                                | Every plugin with all its options                                                  |
| [Plugin factory](https://zilero232.github.io/gulp-plugins-hub/reference/factory)                                | The API for writing your own                                                       |

The docs are also available as plain Markdown for AI assistants: [llms.txt](https://zilero232.github.io/gulp-plugins-hub/llms.txt).

## Write your own plugin

The factory every plugin here is built with turns a transform function into a stream that follows the gulp guidelines:

```ts
import { createPlugin } from '@zilero/gulp-plugin-factory';

export const banner = (text: string) =>
  createPlugin({
    name: 'gulp-banner',
    extensions: ['.js', '.css'],
    transform: (file) => {
      file.contents = Buffer.concat([Buffer.from(`/*! ${text} */\n`), file.contents]);
    }
  });
```

Files without contents and other extensions pass through, and anything `transform` throws becomes a `PluginError` with the file. `parseOptions` validates options with zod or any Standard Schema, and `@zilero/gulp-plugin-factory/testing` runs a plugin in tests without gulp. See [Writing a plugin](https://zilero232.github.io/gulp-plugins-hub/guide/writing-plugins).

## Example app

[`apps/example`](apps/example) is a static site built with every plugin, set up the way a gulp 5 build is in 2026: a TypeScript gulpfile, `pipeline`, a browser-sync dev server, esbuild for the app's modules and a hashed, zipped release. CI builds it from the packages' `dist/` and checks the output. Walkthrough: [Example project](https://zilero232.github.io/gulp-plugins-hub/guide/example-project).

## Contributing

A bun workspace orchestrated by turbo; the toolchain versions are in `mise.toml`.

```sh
bun install
bun run verify          # typecheck, ESLint, Prettier
bun run test            # every package, the example build and the scripts
bun run build           # the packages
bun run docs:dev        # the docs site
bun run changeset       # before a pull request that changes a published package
bun run commit          # a Conventional Commit through commit-jazzer
```

[CONTRIBUTING.md](CONTRIBUTING.md) has the details and [ARCHITECTURE.md](ARCHITECTURE.md) how the repository is built and why each engine was picked. Each package has its changelog in its folder.

## License

[MIT](LICENSE) © Artemev Alexandr
