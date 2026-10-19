# @zilero/gulp-refilename

[![npm](https://img.shields.io/npm/v/@zilero/gulp-refilename?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-refilename)
[![license](https://img.shields.io/npm/l/@zilero/gulp-refilename?color=7c3aed)](./LICENSE)

Rename files in a gulp stream: a new name, a prefix or suffix, another extension or folder, or a function of the path parts. Source maps follow the new name.

```sh
npm install --save-dev @zilero/gulp-refilename
```

```js
import { dest, src } from 'gulp';
import refilename from '@zilero/gulp-refilename';

export const scripts = () =>
  src('src/js/*.js')
    .pipe(refilename({ suffix: '.min' })) // app.js → app.min.js
    .pipe(dest('dist/js'));
```

| Option                  | Example                                                           | Result for `js/app.js` |
| ----------------------- | ----------------------------------------------------------------- | ---------------------- |
| a file name             | `refilename('bundle.js')`                                         | `js/bundle.js`         |
| `prefix`, `suffix`      | `refilename({ prefix: 'v2-', suffix: '.min' })`                   | `js/v2-app.min.js`     |
| `stem`, `extname`       | `refilename({ stem: 'main', extname: 'mjs' })`                    | `js/main.mjs`          |
| `dirname`               | `refilename({ dirname: 'scripts' })`                              | `scripts/app.js`       |
| a function of the parts | `refilename(({ parts }) => ({ stem: parts.stem.toUpperCase() }))` | `js/APP.js`            |

The function may be async; parts it returns as `undefined` stay as they were, and what it returns is checked like the object. A string, `stem`, `prefix` or `suffix` must not contain `/` or `\` (use `{ dirname }` to move files), and invalid options throw when the plugin is created. A rename that would leave `file.base` emits an error.

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/refilename)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { refilename } = require(…)`.

MIT © Artemev Alexandr
