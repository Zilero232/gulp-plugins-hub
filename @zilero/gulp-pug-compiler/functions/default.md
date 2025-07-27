[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-pug-compiler](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

A Gulp plugin that can be used to compile PUG files.

The plugin checks for the presence of a .pug file extension and compiles the
PUG content into HTML. It also supports the use of functions onBeforeCompile
and onAfterCompile to modify the content of the file before and after the
compilation process.

## Parameters

### options

#### pluginOptions?

\{ `logFinal?`: `boolean`; `logProgress?`: `boolean`; `onAfterCompile?`: (...`args`) => `string` \| `Promise`\<`string`\>; `onBeforeCompile?`: (...`args`) => `string` \| `Promise`\<`string`\>; \} = `...`

#### pluginOptions.logFinal?

`boolean` = `...`

#### pluginOptions.logProgress?

`boolean` = `...`

#### pluginOptions.onAfterCompile?

(...`args`) => `string` \| `Promise`\<`string`\> = `...`

#### pluginOptions.onBeforeCompile?

(...`args`) => `string` \| `Promise`\<`string`\> = `...`

#### pugOptions?

`Options` = `...`

## Returns

`Transform`

## Example

```ts
import GulpPugCompiler from "@zilero/gulp-pug-compiler";

gulp.src("src/*.pug")
  .pipe(GulpPugCompiler())
  .pipe(gulp.dest("dist"));
```
