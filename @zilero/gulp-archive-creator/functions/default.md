[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-archive-creator](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

Creates a Gulp plugin that can be used to create archives of files in a stream.

## Parameters

### options

#### archiveOptions?

`ArchiverOptions` = `...`

#### format

`Format` = `...`

#### pluginOptions?

\{ `archiveName`: `string`; `createDirectory?`: `boolean`; `createEmptyArchive?`: `boolean`; `logFinal?`: `boolean`; `logProgress?`: `boolean`; \} = `...`

#### pluginOptions.archiveName

`string` = `...`

#### pluginOptions.createDirectory?

`boolean` = `...`

#### pluginOptions.createEmptyArchive?

`boolean` = `...`

#### pluginOptions.logFinal?

`boolean` = `...`

#### pluginOptions.logProgress?

`boolean` = `...`

## Returns

`Transform`

## Example

```ts
import GulpArchiveCreator from "@zilero/gulp-archive-creator";

gulp.src("src/*.{html,css,js}")
  .pipe(GulpArchiveCreator())
  .pipe(gulp.dest("dist"));
```
