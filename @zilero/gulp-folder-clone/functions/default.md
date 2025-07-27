[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-folder-clone](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

Creates a Gulp plugin that can be used to clone a folder.

## Parameters

### options

#### logFinish?

`boolean` = `...`

#### logProgress?

`boolean` = `...`

#### onBeforeCopy?

(...`args`) => `File` \| `Promise`\<`File`\> = `...`

## Returns

`Transform`

## Example

```ts
import GulpFolderClone from '@zilero/gulp-folder-clone';

// Clone single files
gulp.src("src/images/*.png")
  .pipe(GulpFolderClone())
  .pipe(gulp.dest("dist/images"));
```
