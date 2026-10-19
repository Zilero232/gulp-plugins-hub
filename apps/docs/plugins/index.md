# Plugins

Every plugin is its own package under the `@zilero` scope: install only what the build uses.

```sh
npm install --save-dev gulp @zilero/gulp-scss-compiler @zilero/gulp-css-squeezer
```

## Compile

| Plugin                                  | Does                                                                | Replaces  |
| --------------------------------------- | ------------------------------------------------------------------- | --------- |
| [pug-compiler](/plugins/pug-compiler)   | Pug templates to HTML, with data per file; partials are skipped.    | gulp-pug  |
| [scss-compiler](/plugins/scss-compiler) | SCSS and indented Sass to CSS with sass-embedded, source maps kept. | gulp-sass |

## Optimize

| Plugin                                    | Does                                                                           | Replaces                          |
| ----------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| [html-squeezer](/plugins/html-squeezer)   | Minifies HTML with html-minifier-next presets.                                 | gulp-htmlmin                      |
| [css-squeezer](/plugins/css-squeezer)     | Minifies, prefixes and lowers CSS for your browsers with Lightning CSS.        | gulp-clean-css, gulp-autoprefixer |
| [js-squeezer](/plugins/js-squeezer)       | Minifies JavaScript with terser, source maps chained.                          | gulp-terser, gulp-uglify          |
| [image-squeezer](/plugins/image-squeezer) | Optimizes images, converts to WebP and AVIF, resizes for `srcset`, with sharp. | gulp-imagemin, gulp-webp          |
| [font-switcher](/plugins/font-switcher)   | Converts fonts to woff2, woff, ttf, eot and svg, with glyph subsetting.        | gulp-ttf2woff2, gulp-fontmin      |

## Transform

| Plugin                                      | Does                                                                           | Replaces                   |
| ------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| [file-concat](/plugins/file-concat)         | Joins files into one, in the order you set, with a header and footer.          | gulp-concat, gulp-header   |
| [text-replace](/plugins/text-replace)       | Replaces text with strings, regular expressions or async functions.            | gulp-replace, gulp-header  |
| [refilename](/plugins/refilename)           | Renames files: a name, a prefix or suffix, an extension, a folder, a function. | gulp-rename                |
| [asset-revision](/plugins/asset-revision)   | Content hashes in asset names, references rewritten, a manifest.               | gulp-rev, gulp-rev-rewrite |
| [archive-creator](/plugins/archive-creator) | Packs the stream into a zip, tar or tar.gz archive.                            | gulp-zip, gulp-tar         |

## Route and filter

| Plugin                                | Does                                                                   | Replaces                 |
| ------------------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| [conditional](/plugins/conditional)   | Sends each file through the first branch whose condition holds for it. | gulp-if                  |
| [file-exclude](/plugins/file-exclude) | Drops files by glob, regular expression, size or predicate.            | gulp-filter, gulp-ignore |
| [file-changed](/plugins/file-changed) | Lets through only the files that changed since the last build.         | gulp-changed, gulp-newer |
| [folder-clone](/plugins/folder-clone) | Copies every file into extra folders in one pass.                      | gulp-clone               |

All of them are built with the [plugin factory](/guide/writing-plugins), which you can use for your own.
