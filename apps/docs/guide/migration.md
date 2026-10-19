# Migrating from 1.x

2.0 rewrites every package for gulp 5 and Node.js 22.13+. The packages keep their names; the options changed where 1.x had bugs or nested everything under `pluginOptions`.

## Everywhere

- **Node.js 22.13+**, ES modules. In a CommonJS gulpfile use the named export: `const { scssCompiler } = require('@zilero/gulp-scss-compiler')`.
- **gulp is no longer a peer dependency**, as the [gulp guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md) ask.
- **Hooks are flat and get the file**: `pluginOptions: { onBeforeMinify(content) }` became `onBeforeMinify({ content, file })`.
- **Errors** are `PluginError`s with the plugin name and file, emitted on the stream. Invalid options list every problem instead of printing a box and throwing an empty error.
- **Files without contents** (directories, `read: false`) pass through instead of failing with `File is null`.
- **Files outside a plugin's formats pass through**: the minifiers and compilers only touch their own extensions.
- **Binary files** need `src(globs, { encoding: false })` with gulp 5; image and font plugins say so when they get a file read as text.

## Package by package

| Package              | 1.x                                                                                            | 2.0                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| gulp-plugin-factory  | `GulpPluginFactory({ pluginName, onFile, onFinish })`; `undefined` dropped the file            | `createPlugin({ name, transform, flush })`; nothing returned keeps the file, `null` drops it. Plus `parseOptions`, source map and testing helpers. |
| gulp-refilename      | object only                                                                                    | also a file name string or a function of the path parts                                                                                            |
| gulp-file-exclude    | `patterns` matched as substrings; `size: [min, max]`; `onExclude`                              | `patterns` are globs or RegExps; `size: { min, max }`; `exclude`                                                                                   |
| gulp-conditional     | the condition was checked once, for the whole stream                                           | checked per file, conditions get the file, branches created on first use                                                                           |
| gulp-folder-clone    | `onBeforeCopy`; files passed through unchanged                                                 | copies every file into `dirs`; `keepOriginal`, `onClone`                                                                                           |
| gulp-archive-creator | `format`, `archiveOptions`, `pluginOptions.archiveName`                                        | `name` (format from its extension), `format`, `archiverOptions`, `emptyArchive`, `directories`; tgz                                                |
| gulp-font-switcher   | fontmin; `pluginOptions.format`, `fontOptions.glyph`                                           | harfbuzz subsetting and fontverter, every OpenType table kept (no native build); `formats` (several at once), `subset`, `hinting`, `keepOriginal`  |
| gulp-html-squeezer   | html-minifier-terser, nothing minified without options                                         | html-minifier-next, `preset: 'conservative'` by default                                                                                            |
| gulp-js-squeezer     | `minifyOptions`, no source maps                                                                | `terserOptions`, source maps chained                                                                                                               |
| gulp-pug-compiler    | rendered the file on disk, partials included                                                   | renders the contents; `data`, `extname`, `skipPartials`                                                                                            |
| gulp-scss-compiler   | `scssOptions`; compiled the file on disk (`onBeforeCompile` was ignored), one process per file | `sassOptions`; compiles the contents with one compiler per stream; partials skipped; source maps; `.sass`                                          |

Each plugin page ends with its own migration notes.

## New in 2.0

[css-squeezer](/plugins/css-squeezer), [image-squeezer](/plugins/image-squeezer), [file-concat](/plugins/file-concat), [text-replace](/plugins/text-replace), [asset-revision](/plugins/asset-revision) and [file-changed](/plugins/file-changed).
