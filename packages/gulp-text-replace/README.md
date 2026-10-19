# @zilero/gulp-text-replace

[![npm](https://img.shields.io/npm/v/@zilero/gulp-text-replace?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-text-replace)
[![license](https://img.shields.io/npm/l/@zilero/gulp-text-replace?color=7c3aed)](./LICENSE)

Replace text in the files of a gulp stream with strings or regular expressions, sync or async replacers that see the file, and add a header or footer. Source maps follow every change; binary files are left alone.

```sh
npm install --save-dev @zilero/gulp-text-replace
```

```js
import { dest, src } from 'gulp';
import textReplace from '@zilero/gulp-text-replace';

export const release = () =>
  src('dist/**/*.{html,js}')
    .pipe(
      textReplace({
        rules: [
          { search: '__VERSION__', replace: '2.0.0' }, // literal, every occurrence
          { search: /https?:\/\/localhost:\d+/g, replace: 'https://example.com' }
        ],
        header: '/*! My site | MIT */\n'
      })
    )
    .pipe(dest('release'));
```

| Option       | Default | Description                                                                     |
| ------------ | ------- | ------------------------------------------------------------------------------- |
| `rules`      | none    | `{ search, replace }` or a list, applied in order. `replace` can be a function. |
| `header`     | none    | Added at the start of every file: a string or a function of the file.           |
| `footer`     | none    | Added at the end of every file: a string or a function of the file.             |
| `skipBinary` | `true`  | Leave files with a NUL byte in their first 8000 bytes untouched.                |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/text-replace)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { textReplace } = require(…)`.

MIT © Artemev Alexandr
