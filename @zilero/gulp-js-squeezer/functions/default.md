[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-js-squeezer](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

A Gulp plugin that can be used to minify JavaScript files.

The plugin processes the JavaScript content of each file in the stream, minifying it
and logging the results. If the file is not a Buffer, it is skipped.

The plugin also provides statistics on the number of files processed and the
number of errors encountered.

## Parameters

### options

#### minifyOptions?

`MinifyOptions` = `...`

#### pluginOptions?

\{ `logFinal?`: `boolean`; `logProgress?`: `boolean`; `onAfterMinify?`: (...`args`) => `string` \| `Promise`\<`string`\>; `onBeforeMinify?`: (...`args`) => `string` \| `Promise`\<`string`\>; \} = `...`

#### pluginOptions.logFinal?

`boolean` = `...`

#### pluginOptions.logProgress?

`boolean` = `...`

#### pluginOptions.onAfterMinify?

(...`args`) => `string` \| `Promise`\<`string`\> = `...`

#### pluginOptions.onBeforeMinify?

(...`args`) => `string` \| `Promise`\<`string`\> = `...`

## Returns

`Transform`

## Example

```ts
import GulpJsSqueezer from "@zilero/gulp-js-squeezer";

gulp.src("src/*.js")
  .pipe(GulpJsSqueezer())
  .pipe(gulp.dest("dist"));
```
