<h1 align="center">gulp-plugins-hub</h1>

<p align="center">
  <b>Typed plugins for gulp 5.</b><br>
  Pug, Sass, Lightning CSS, terser, sharp, fonts, archives and cache-busting — one API, options checked up front, errors that name the file.
</p>

<p align="center">
  <a href="https://github.com/Zilero232/gulp-plugins-hub/actions/workflows/release.yml"><img src="https://img.shields.io/github/actions/workflow/status/Zilero232/gulp-plugins-hub/release.yml?branch=master&label=CI&logo=github" alt="CI"></a>
  <a href="https://www.npmjs.com/org/zilero"><img src="https://img.shields.io/badge/npm-%40zilero-7c3aed?logo=npm" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Zilero232/gulp-plugins-hub?color=7c3aed" alt="license"></a>
</p>

<p align="center">
  <a href="https://zilero232.github.io/gulp-plugins-hub/"><img src="https://img.shields.io/badge/Documentation-zilero232.github.io%2Fgulp--plugins--hub-7c3aed?style=for-the-badge&logo=vitepress&logoColor=white" alt="Documentation"></a>
</p>

## Quick start

```sh
npm install --save-dev gulp @zilero/gulp-scss-compiler @zilero/gulp-css-squeezer
```

```js
// gulpfile.mjs
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';
import cssSqueezer from '@zilero/gulp-css-squeezer';
import scssCompiler from '@zilero/gulp-scss-compiler';

export const styles = () =>
  pipeline(
    src('src/styles/*.scss', { sourcemaps: true }),
    scssCompiler(),
    cssSqueezer({ targets: 'defaults' }),
    dest('dist/css', { sourcemaps: '.' })
  );
```

Requires Node.js 22.13 or newer.

## Packages

| Package                                                         | Does                                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`@zilero/gulp-pug-compiler`](packages/gulp-pug-compiler)       | Pug templates to HTML, with data per file.                             |
| [`@zilero/gulp-scss-compiler`](packages/gulp-scss-compiler)     | SCSS and Sass to CSS with sass-embedded, one compiler per build.       |
| [`@zilero/gulp-html-squeezer`](packages/gulp-html-squeezer)     | Minifies HTML with html-minifier-next presets.                         |
| [`@zilero/gulp-css-squeezer`](packages/gulp-css-squeezer)       | Minifies, prefixes and lowers CSS with Lightning CSS.                  |
| [`@zilero/gulp-js-squeezer`](packages/gulp-js-squeezer)         | Minifies JavaScript with terser.                                       |
| [`@zilero/gulp-image-squeezer`](packages/gulp-image-squeezer)   | Optimizes images, converts to WebP and AVIF, resizes for `srcset`.     |
| [`@zilero/gulp-font-switcher`](packages/gulp-font-switcher)     | Converts fonts to woff2, woff, ttf, eot and svg, with subsetting.      |
| [`@zilero/gulp-file-concat`](packages/gulp-file-concat)         | Joins files into one, in the order you set, with a header and footer.  |
| [`@zilero/gulp-text-replace`](packages/gulp-text-replace)       | Replaces text with strings, regular expressions or async functions.    |
| [`@zilero/gulp-refilename`](packages/gulp-refilename)           | Renames files.                                                         |
| [`@zilero/gulp-asset-revision`](packages/gulp-asset-revision)   | Content hashes in asset names, references rewritten, a manifest.       |
| [`@zilero/gulp-archive-creator`](packages/gulp-archive-creator) | Packs files into a zip, tar or tar.gz archive.                         |
| [`@zilero/gulp-conditional`](packages/gulp-conditional)         | Sends each file through the first branch whose condition holds for it. |
| [`@zilero/gulp-file-exclude`](packages/gulp-file-exclude)       | Drops files by glob, regular expression, size or predicate.            |
| [`@zilero/gulp-file-changed`](packages/gulp-file-changed)       | Lets through only the files that changed since the last build.         |
| [`@zilero/gulp-folder-clone`](packages/gulp-folder-clone)       | Copies every file into extra folders.                                  |
| [`@zilero/gulp-plugin-factory`](packages/gulp-plugin-factory)   | The factory they are built with: write your own plugin in a few lines. |

## Why

- **Built for gulp 5**: ES modules, source maps through `src`/`dest`, binary files guarded against gulp 5's UTF-8 default.
- **Options checked when the plugin is created**: a typo or a wrong type fails with a list of problems, not with a build that silently does nothing.
- **Follows the gulp guidelines**: files without contents pass through, errors are `PluginError`s with the file, gulp is never a dependency.
- **Modern engines** instead of unmaintained ones: Lightning CSS, html-minifier-next, sass-embedded, sharp, fonteditor-core.

## Example

[`apps/example/`](apps/example) is a static site built with every plugin, set up the way a gulp 5 build is in 2026: a TypeScript gulpfile, `pipeline`, a browser-sync dev server, esbuild for the app, a hashed and zipped release. CI runs it on the built packages as part of `bun run test`.

How the repository is built, and why each engine was picked: [ARCHITECTURE.md](ARCHITECTURE.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Each package has its own changelog in its folder.

## License

[MIT](LICENSE) © Artemev Alexandr
