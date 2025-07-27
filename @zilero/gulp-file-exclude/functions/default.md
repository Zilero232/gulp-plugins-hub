[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-file-exclude](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

Creates a Gulp plugin that excludes files based on patterns.

## Parameters

### options

#### logExcluded?

`boolean` = `...`

#### onExclude?

(...`args`) => `Promise`\<`boolean`\> = `...`

#### patterns?

(`string` \| `RegExp`)[] = `...`

#### size?

(`undefined` \| `number`)[] = `...`

## Returns

`Transform`

## Example

```ts
import GulpFileExclude from '@zilero/gulp-file-exclude';

// Exclude files by patterns
gulp.src("src/images/*.png")
  .pipe(GulpFileExclude({
    patterns: [
      '.test.',
      /\.spec\./,
    ],
    size: [
      10, // min size in bytes
      100, // max size in bytes
    ],
    onExclude: async (file) => {
      return true;
    },
  }))
  .pipe(gulp.dest("dist/images"));
```
