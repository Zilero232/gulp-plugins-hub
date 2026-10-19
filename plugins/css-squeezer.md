---
url: /gulp-plugins-hub/plugins/css-squeezer.md
---
# css-squeezer

Minifies CSS, adds the vendor prefixes your browsers need and lowers modern syntax (nesting, `oklch()`, …) with Lightning CSS: clean-css and autoprefixer in one pass. When the file has a source map, the new map is chained to it.

```sh
npm install --save-dev @zilero/gulp-css-squeezer
```

## Usage

```js
import { dest, src } from 'gulp';
import cssSqueezer from '@zilero/gulp-css-squeezer';

export const styles = () =>
  src('dist/css/**/*.css')
    .pipe(cssSqueezer({ targets: '> 0.5%, last 2 versions, not dead' }))
    .pipe(dest('dist/css'));
```

With source maps, after a Sass compiler for example:

```js
import scssCompiler from '@zilero/gulp-scss-compiler';

export const styles = () =>
  src('src/styles/**/*.scss', { sourcemaps: true })
    .pipe(scssCompiler())
    .pipe(cssSqueezer())
    .pipe(dest('dist/css', { sourcemaps: '.' })); // the map points to the .scss sources
```

## Options

| Option                | Type                                               | Default                                      | Description                                                                                                     |
| --------------------- | -------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `targets`             | `string \| string[]`                               | the browserslist config nearest to each file | The browsers to support, as a browserslist query: `'defaults'`, `['> 0.5%', 'not dead']`. See below.            |
| `minify`              | `boolean`                                          | `true`                                       | Minify the output. `false` only adds prefixes and lowers syntax.                                                |
| `lightningcssOptions` | `TransformOptions`                                 | —                                            | Other Lightning CSS options, as an object: `drafts`, `nonStandard`, `errorRecovery`, `cssModules`, `visitor`, … |
| `onBeforeMinify`      | `({ content, file }) => string \| Promise<string>` | —                                            | Runs on the source before Lightning CSS and returns the stylesheet to process.                                  |
| `onAfterMinify`       | `({ content, file }) => string \| Promise<string>` | —                                            | Runs on the output and returns the final stylesheet. Source maps do not follow changes made here.               |

Unknown keys, an empty `targets` query and a `lightningcssOptions` that is not an object are an error when the plugin is created. So is a query browserslist does not understand, with `Invalid targets: …` and browserslist's message, before any file is read.

### Targets

The browsers come from the first of these that exists:

1. The `targets` option.
2. The browserslist config nearest to the file: a `.browserslistrc` or the `browserslist` key of a `package.json`, looked up from the file's folder upward. It is resolved once per folder: files in the same folder share the result.
3. browserslist's defaults.

Prefixes are added and syntax is lowered only as far as those browsers need: for `chrome 130` nesting stays as it is, for `safari 10` it is flattened and `user-select` gets its `-webkit-` prefix.

## Notes

* Only `.css` files are processed, in any case. Other files, and files without contents (`read: false`), pass through untouched.
* With `src(…, { sourcemaps: true })`, Lightning CSS writes a map, and the plugin chains it to the map the file already had, such as the one from a Sass compiler: the result points to the `.scss` sources only, without the intermediate CSS file as an extra source. Source names use `/` on every OS.
* A syntax error from Lightning CSS emits a PluginError with the file path, `lineNumber` set and the message suffixed with where it is: `Unexpected end of input (line 3, column 1)`. Other errors from Lightning CSS or a hook emit a PluginError with the file path. `lightningcssOptions: { errorRecovery: true }` skips invalid rules instead.
* The tool is [Lightning CSS](https://lightningcss.dev); its options go through `lightningcssOptions`, except `code`, `filename`, `sourceMap`, `minify` and `targets`, which the plugin sets, and `inputSourceMap`, since the plugin chains the input map itself.
