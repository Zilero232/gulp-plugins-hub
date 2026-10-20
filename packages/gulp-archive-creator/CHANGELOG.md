# @zilero/gulp-archive-creator

## 2.1.0

### Minor Changes

- [#11](https://github.com/Zilero232/gulp-plugins-hub/pull/11) [`27a02d3`](https://github.com/Zilero232/gulp-plugins-hub/commit/27a02d38f73b4ffd652b58dac4cfb7fc68295b0f) Thanks [@Zilero232](https://github.com/Zilero232)! - Every package now shares one version, and each README is a complete reference: options with types, hooks, source maps, errors, recipes and migration from the popular alternative.
  
  **Factory**
  
  - `createPlugin` takes `extensions` (only these extensions, in lowercase, are transformed), `binary` (refuses files read as UTF-8 text) and `dispose` (runs once when the stream ends, fails or is destroyed).
  - New helpers: `runContentHook` (names a hook that returns no text), `syncSourceMapFile`, `createPathMatcher({ patterns, ignoreCase })`, `isUrl`, and the `FileHookInput` type.
  - `applySourceMap({ chain: true })` chains only the source that is the file itself; other sources keep their mappings.
  - `isRelativePathInside` rejects drive-relative paths such as `C:x`; `parseOptions` detects any thenable schema result.
  
  **Plugins**
  
  - Every content hook that returns something other than a string fails with an error naming the option.
  - image-squeezer: PNG output is lossless by default (sharp's `effort` had turned on palette quantisation); opt in with `encoderOptions.png.palette` and `quality.png`. Widths larger than the image are replaced by its real width, so names match the pixels. Asking for the source's own format counts as `'original'`. Unknown `encoderOptions` keys are rejected.
  - asset-revision: robots.txt, favicon.ico, sitemaps, service workers, web manifests and `.well-known/**` keep their names by default, and files without an extension are never renamed. Two files with the same path from different bases fail with a clear error. Unchanged text files keep their bytes. Renamed files get `revOrigPath`, `revOrigBase` and `revHash`.
  - font-switcher: `formats` defaults to `['woff2']`; two sources writing the same file fail with a clear error.
  - archive-creator: new `modifiedTime`; entries without a date get a fixed one, so archives are reproducible. A name whose extension contradicts `format` is rejected.
  - js-squeezer: `.mjs` is minified as a module unless `terserOptions.module` is set; empty terser output fails instead of writing an empty file.
  - css-squeezer: new `onWarning` hook for Lightning CSS warnings.
  - html-squeezer: a source map the file arrives with is dropped, since it no longer matches.
  - scss-compiler: the file's input map is chained into Sass's map; the compiler stops when the stream is destroyed.
  - pug-compiler: `file.data` (gulp-data, front matter) is merged into the locals, with `data` winning; `skipPartials` also skips folders starting with `_`.
  - conditional: `condition` also takes a glob, a RegExp or an array of them; a handler that returns no stream fails with a clear error.
  - file-changed: new `extra` globs (Sass partials, configs) that count as dependencies of every file; a `dest` that is a file counts as not built.
  - file-concat: inputs with the same name get unique source names, the bundle takes the newest input's `stat`, and a BOM is stripped from each input.
  - file-exclude: new `invert` keeps only the matching files.
  - folder-clone: a copy renamed in `onClone` gets the right source map name; repeated `dirs` are rejected.
  - refilename: gulp-rename style functions that change `parts` and return nothing work; unknown keys fail with a hint (`basename` → `stem`); `prefix` and `suffix` work in function results; directories keep their names.
  - text-replace: replacer results are converted with `String()` like `String.prototype.replace`, and `undefined` fails with a clear error; a header goes after a BOM.

### Patch Changes

- Updated dependencies [[`27a02d3`](https://github.com/Zilero232/gulp-plugins-hub/commit/27a02d38f73b4ffd652b58dac4cfb7fc68295b0f)]:
  - @zilero/gulp-plugin-factory@2.1.0

## 2.0.0

### Major Changes

- [#5](https://github.com/Zilero232/gulp-plugins-hub/pull/5) [`433e124`](https://github.com/Zilero232/gulp-plugins-hub/commit/433e1243540572f754c8d8ffde05a1ee47107579) Thanks [@Zilero232](https://github.com/Zilero232)! - Rewrite every package for gulp 5 and Node.js 22.13: ES modules built with tsdown, options validated when the plugin is created, flat hooks that get the file, errors emitted as PluginErrors with the file, and files without contents passed through. See the migration guide: https://zilero232.github.io/gulp-plugins-hub/guide/migration
  
  New plugins: css-squeezer (Lightning CSS), image-squeezer (sharp), file-concat, text-replace, asset-revision and file-changed.

### Patch Changes

- Updated dependencies [[`433e124`](https://github.com/Zilero232/gulp-plugins-hub/commit/433e1243540572f754c8d8ffde05a1ee47107579)]:
  - @zilero/gulp-plugin-factory@2.0.0

## 1.0.4

### Patch Changes

- 3559097: Added a new plugins, sass compiler and fonts convert
- Updated dependencies [3559097]
  - @zilero/gulp-plugin-factory@1.0.4

## 1.0.3

### Patch Changes

- 279c98c: Update README and refactor refilename plugin
- Updated dependencies [279c98c]
  - @zilero/gulp-plugin-factory@1.0.3

## 1.0.2

### Patch Changes

- 4dd0ab8: Added README.md and added zod schema for plugin
- Updated dependencies [4dd0ab8]
  - @zilero/gulp-plugin-factory@1.0.2

## 1.0.1

### Patch Changes

- 866c65e: Added a new plugins
- Updated dependencies [866c65e]
  - @zilero/gulp-plugin-factory@1.0.1
