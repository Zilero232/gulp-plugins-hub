---
url: /gulp-plugins-hub/plugins/scss-compiler.md
---
# scss-compiler

Compiles SCSS and indented Sass to CSS with the modern Sass compiler (sass-embedded), from the file contents. One compiler process serves each stream, partials are dropped, and the file gets a source map when it had one.

```sh
npm install --save-dev @zilero/gulp-scss-compiler
```

## Usage

```js
import { dest, src } from 'gulp';
import scssCompiler from '@zilero/gulp-scss-compiler';

export const styles = () =>
  src('src/styles/**/*.scss')
    .pipe(scssCompiler({ sassOptions: { style: 'compressed' } })) // main.scss → main.css
    .pipe(dest('dist/css'));
```

With source maps:

```js
export const styles = () =>
  src('src/styles/**/*.scss', { sourcemaps: true })
    .pipe(scssCompiler())
    .pipe(dest('dist/css', { sourcemaps: '.' })); // main.css and main.css.map
```

## Options

| Option            | Type                                               | Default | Description                                                                                                                                 |
| ----------------- | -------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `sassOptions`     | `StringOptions`                                    | `{}`    | Passed to Sass: `style`, `loadPaths`, `importers`, `functions`, `silenceDeprecations`, … except `url`, `syntax` and the source map options. |
| `skipPartials`    | `boolean`                                          | `true`  | Drop partials (`_variables.scss`) instead of compiling them on their own.                                                                   |
| `onBeforeCompile` | `({ content, file }) => string \| Promise<string>` | —       | Runs on the source before Sass and returns the source to compile.                                                                           |
| `onAfterCompile`  | `({ content, file }) => string \| Promise<string>` | —       | Runs on the compiled CSS and returns the final CSS. The file is already renamed to `.css`. Source maps do not follow changes made here.     |

Unknown keys, and a `sassOptions` that is not an object, are an error when the plugin is created.

## Notes

* `.scss` files are compiled as SCSS and `.sass` files as indented syntax, in any case; both become `.css`. Other files, plain `.css` included, and files without contents (`read: false`) pass through untouched.
* `@use` and `@import` resolve relative to the file, then from `sassOptions.loadPaths`, then from `file.base`, which is always searched.
* With `skipPartials`, partials leave the stream, so they are not written to `dest`; other files still load them from disk.
* With `src(…, { sourcemaps: true })`, Sass writes a map with the sources included, relative to `file.base`. Without it, no map is made. `sourceMap`, `sourceMapIncludeSources`, `syntax` and `url` come from the file, not from `sassOptions`.
* Each stream gets one Sass compiler. It starts with the first Sass file to compile and stops when the stream ends or is destroyed by an error, so it never outlives the task.
* A compiler that fails to start, for example because the sass-embedded binary for your platform is missing, fails the file that needed it with a PluginError naming its path, and that error ends the stream as any other error does. The start is not retried for later files.
* A Sass error emits a PluginError that points at the stylesheet where it happened, often a partial, and its line. The message is Sass's own, without the `Error:` prefix, and the details leave out Sass's raw span objects. Other errors, from a hook for example, name the file being compiled.
* The compiler is [sass-embedded](https://sass-lang.com/dart-sass/), the Dart Sass compiler; its options go through `sassOptions`.

## Migrating from 1.x

* `scssOptions` is renamed to `sassOptions`; `url`, `syntax` and `sourceMap` are no longer options because they come from the file.
* 1.x compiled the file from disk, so the result of `onBeforeCompile` was ignored. Now the file contents are compiled, including changes from earlier plugins and from the hook.
* One sass-embedded compiler serves each stream instead of a Sass process per file, and it is stopped at the end or on an error.
* `.sass` files with the indented syntax are supported.
* Partials are dropped by default; 1.x compiled them as well. `skipPartials: false` keeps them.
* Source maps are applied when the file has one; 1.x applied none.
* The hooks moved from `pluginOptions` to the top level and get `{ content, file }`. `onAfterCompile` sees the file already renamed to `.css`.
* Errors are prefixed with `@zilero/gulp-scss-compiler`; 1.x said `GulpScssSqueezer`.

See [migrating from 1.x](/guide/migration) for every package.
