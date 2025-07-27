[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-html-squeezer](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

A Gulp plugin that can be used to minify HTML files.

## Parameters

### options

#### htmlMinifierOptions?

`Options` = `...`

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
import GulpHtmlSqueezer from "@zilero/gulp-html-squeezer";

gulp.src("src/*.html")
  .pipe(GulpHtmlSqueezer())
  .pipe(gulp.dest("dist"));
```
