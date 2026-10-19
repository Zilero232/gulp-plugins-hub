# @zilero/gulp-css-squeezer

[![npm](https://img.shields.io/npm/v/@zilero/gulp-css-squeezer?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-css-squeezer)
[![license](https://img.shields.io/npm/l/@zilero/gulp-css-squeezer?color=7c3aed)](./LICENSE)

Minify CSS, add vendor prefixes and lower modern syntax for your browserslist targets in one pass with Lightning CSS, keeping source maps.

```sh
npm install --save-dev @zilero/gulp-css-squeezer
```

```js
import { dest, src } from 'gulp';
import cssSqueezer from '@zilero/gulp-css-squeezer';

export const styles = () =>
  src('dist/css/**/*.css', { sourcemaps: true })
    .pipe(cssSqueezer({ targets: '> 0.5%, last 2 versions, not dead' }))
    .pipe(dest('dist/css', { sourcemaps: '.' }));
```

| Option                            | Default                                      | Description                                                                                    |
| --------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `targets`                         | the browserslist config nearest to each file | A browserslist query, a string or an array. An invalid query fails when the plugin is created. |
| `minify`                          | `true`                                       | `false` only adds prefixes and lowers syntax.                                                  |
| `lightningcssOptions`             | —                                            | Other Lightning CSS options: `drafts`, `errorRecovery`, …                                      |
| `onBeforeMinify`, `onAfterMinify` | —                                            | `({ content, file }) => string` hooks around Lightning CSS.                                    |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/css-squeezer)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { cssSqueezer } = require(…)`.

MIT © Artemev Alexandr
