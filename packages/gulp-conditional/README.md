# @zilero/gulp-conditional

[![npm](https://img.shields.io/npm/v/@zilero/gulp-conditional?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-conditional)
[![license](https://img.shields.io/npm/l/@zilero/gulp-conditional?color=7c3aed)](./LICENSE)

Send each file of a gulp stream through the first branch whose condition holds for it, like if / else if / else for streams.

```sh
npm install --save-dev @zilero/gulp-conditional
```

```js
import { dest, src } from 'gulp';
import conditional from '@zilero/gulp-conditional';
import htmlSqueezer from '@zilero/gulp-html-squeezer';
import jsSqueezer from '@zilero/gulp-js-squeezer';

export const build = () =>
  src('src/**')
    .pipe(
      conditional({
        handlers: [
          { condition: ({ file }) => file.extname === '.js', handler: () => jsSqueezer() },
          { condition: ({ file }) => file.extname === '.html', handler: () => htmlSqueezer() }
        ]
      })
    )
    .pipe(dest('dist'));
```

| Option                 | Description                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `handlers[].condition` | A boolean, or a function of `{ file }` that returns one (sync or async).                                         |
| `handlers[].handler`   | Creates the stream the matching files go through, once, for the first such file; an array of streams is a chain. |
| `defaultHandler`       | Creates the stream for files no condition matched. Without it they pass through.                                 |

To chain plugins in a branch, return an array such as `() => [scssCompiler(), cssSqueezer()]`, not `a().pipe(b())`: `.pipe()` returns `b`, so the files would skip `a`.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/conditional)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { conditional } = require(…)`.

MIT © Artemev Alexandr
