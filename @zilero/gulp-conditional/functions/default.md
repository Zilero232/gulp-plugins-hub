[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-conditional](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

Conditional plugin that allows you to execute different handlers based on conditions.

## Parameters

### options

#### defaultHandler?

(...`args`) => `Transform` = `...`

#### handlers

`object`[] = `...`

## Returns

`Transform`

## Example

```ts
import GulpConditional from "@zilero/gulp-conditional";

gulp.src("src/*.js")
  .pipe(GulpConditional({
    handlers: [
      {
        condition: () => true,
        handler: GulpJsSqueezer({
          minifyOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      },
      {
        condition: () => false,
        handler: GulpFileExclude({
          patterns: ['2'],
        }),
      },
    ],
    defaultHandler: GulpFileExclude({
      patterns: ['3'],
    }),
  }))
  .pipe(gulp.dest("dist"));
```
