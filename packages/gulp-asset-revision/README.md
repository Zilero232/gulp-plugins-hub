# @zilero/gulp-asset-revision

[![npm](https://img.shields.io/npm/v/@zilero/gulp-asset-revision?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-asset-revision)
[![license](https://img.shields.io/npm/l/@zilero/gulp-asset-revision?color=7c3aed)](./LICENSE)

Cache-busting for a gulp stream: add a content hash to asset names, rewrite the references in HTML, CSS and JavaScript, and write a manifest. Files are hashed after the assets they reference, in any stream order.

```sh
npm install --save-dev @zilero/gulp-asset-revision
```

```js
import { dest, src } from 'gulp';
import assetRevision from '@zilero/gulp-asset-revision';

export const revision = () =>
  src('build/**', { encoding: false }) // the whole site at once
    .pipe(assetRevision({ manifest: true })) // css/main.css → css/main-3f2a9c1b7d.css
    .pipe(dest('release'));
```

| Option       | Default                        | Description                                                           |
| ------------ | ------------------------------ | --------------------------------------------------------------------- |
| `hashLength` | `10`                           | Characters of the SHA-256 hash added to names.                        |
| `exclude`    | `['*.html', '*.htm', '*.map']` | Globs of files that keep their names. Replaces the default list.      |
| `rewrite`    | HTML, CSS, SVG, JS, JSON, …    | Extensions whose references are rewritten, or `false` to only rename. |
| `manifest`   | `false`                        | `true` or `{ path }`: emit a JSON map of original to revised paths.   |

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/asset-revision)** · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · Requires Node.js 22.13+ and gulp 4 or 5. ESM; in CommonJS use `const { assetRevision } = require(…)`.

MIT © Artemev Alexandr
