# @zilero/gulp-plugin-factory

[![npm](https://img.shields.io/npm/v/@zilero/gulp-plugin-factory?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-plugin-factory)
[![license](https://img.shields.io/npm/l/@zilero/gulp-plugin-factory?color=7c3aed)](./LICENSE)

Build typed gulp plugins in a few lines. A stream factory that follows the gulp plugin guidelines, option validation with any Standard Schema, source map helpers and testing helpers. Every `@zilero/gulp-*` plugin is built with it.

```sh
npm install @zilero/gulp-plugin-factory
```

```ts
import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

const schema = z.object({ text: z.string().min(1) }).strict();

export const banner = (options: z.input<typeof schema>) => {
  const { text } = parseOptions({ name: 'gulp-banner', schema, options });

  return createPlugin({
    name: 'gulp-banner',
    filter: (file) => file.extname === '.js',
    transform: (file) => {
      file.contents = Buffer.concat([Buffer.from(`${text}\n`), file.contents]);
    }
  });
};
```

| Export                                   | Does                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `createPlugin`                           | A Vinyl transform stream from a `transform` / `flush` definition, errors as `PluginError`s. |
| `parseOptions`                           | Validates options with zod, valibot, arktype or any Standard Schema; lists every problem.   |
| `applySourceMap`, `getInputSourceMap`    | Chain and store source maps the way `src` / `dest` `sourcemaps` expect.                     |
| `assertBinaryContents`                   | Explains the fix when gulp 5 read a binary file as UTF-8.                                   |
| `createFile`, `runPlugin`, `getContents` | From `@zilero/gulp-plugin-factory/testing`: test a plugin without gulp.                     |

**[Guide](https://zilero232.github.io/gulp-plugins-hub/guide/writing-plugins)** · [API reference](https://zilero232.github.io/gulp-plugins-hub/reference/factory) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+. ESM; in CommonJS use `const { createPlugin } = require(…)`.

MIT © Artemev Alexandr
