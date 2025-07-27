[**Gulp Plugins Hub v1.0.0**](../../../README.md)

***

[Gulp Plugins Hub](../../../packages.md) / [@zilero/gulp-plugin-factory](../README.md) / default

# Function: default()

> **default**(`options`): `Transform`

Creates a Gulp plugin that can be used to transform files.

## Parameters

### options

#### onFile

(...`args`) => `Promise`\<`void` \| `File`\> = `onFileSchema`

#### onFinish?

(...`args`) => `Promise`\<`void`\> = `...`

#### pluginName

`string` = `...`

## Returns

`Transform`

## Example

```ts
import PluginFactory from '@zilero/gulp-plugin-factory';

const plugin = PluginFactory({
  onFile: async (file) => {
    // Do something with the file
    return file;
  },
  onFinish: async (stream) => {
    // Do something with the stream
  }
});
