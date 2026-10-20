# @zilero/gulp-asset-revision

Cache-busting for a gulp stream: add a content hash to asset names, rewrite the references in HTML, CSS and JavaScript, and write a manifest.

[![npm](https://img.shields.io/npm/v/@zilero/gulp-asset-revision?color=7c3aed&logo=npm)](https://www.npmjs.com/package/@zilero/gulp-asset-revision)
[![install size](https://packagephobia.com/badge?p=@zilero/gulp-asset-revision)](https://packagephobia.com/result?p=@zilero/gulp-asset-revision)
[![node](https://img.shields.io/node/v/@zilero/gulp-asset-revision?color=7c3aed)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@zilero/gulp-asset-revision?color=7c3aed)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-zilero232.github.io-7c3aed?logo=vitepress&logoColor=white)](https://zilero232.github.io/gulp-plugins-hub/plugins/asset-revision)

Renames assets after a hash of their contents (`main.css` → `main-3f2a9c1b7d.css`) and rewrites the references to them in the same pass. Pages, source maps and files fetched at fixed URLs keep their names.

Replaces `gulp-rev` + `gulp-rev-rewrite` (and `gulp-rev-all`).

- Renaming and rewriting in one plugin, no manifest to pass between two.
- Hashes follow references: an image change also renames the CSS and JS that use it, whatever the stream order.
- References resolved the way a browser does: root-relative, `../`, `./` and bare paths, written back the same way.
- Safe defaults: pages, `robots.txt`, `favicon.ico`, sitemaps, service workers, `.well-known/` and files without an extension keep their names.
- Optional `rev-manifest.json` for server-side templates; `revOrigPath` and `revHash` on each file, as gulp-rev sets them.

## Install

```sh
npm install --save-dev @zilero/gulp-asset-revision
# pnpm add -D @zilero/gulp-asset-revision · bun add -d @zilero/gulp-asset-revision
```

gulp is not a dependency: the plugin works with the gulp your project has.

## Usage

```ts
// gulpfile.ts
import { assetRevision } from '@zilero/gulp-asset-revision';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

export const revision = (): Promise<void> =>
  pipeline(
    src('build/**/*', { encoding: false }), // the whole site at once; images stay intact
    assetRevision({ manifest: true }), // css/main.css → css/main-3f2a9c1b7d.css
    dest('release')
  );
```

In CommonJS: `const { assetRevision } = require('@zilero/gulp-asset-revision')`.

## Options

| Option       | Type                           | Default   | Description                                                                                                                                        |
| ------------ | ------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hashLength` | `number`                       | `10`      | Characters of the SHA-256 hash added to names, from 4 to 64.                                                                                       |
| `exclude`    | `string[]`                     | see below | Globs of files that keep their names; references inside them are still rewritten. Case is ignored. Replaces the default list.                      |
| `rewrite`    | `string[] \| false`            | see below | Extensions (with the dot) of text files whose references are rewritten, or `false` to only rename.                                                 |
| `manifest`   | `boolean \| { path?: string }` | `false`   | Emit a JSON manifest of original to revised paths. `true` writes `rev-manifest.json`; `path` is relative to the output folder and must stay in it. |

Default `exclude`: `*.html`, `*.htm`, `*.map`, `robots.txt`, `humans.txt`, `ads.txt`, `favicon.ico`, `apple-touch-icon*.png`, `browserconfig.xml`, `sitemap*.xml`, `sw.js`, `service-worker.js`, `*.webmanifest`, `.well-known/**`. Files without an extension (`CNAME`, `.htaccess`, `_redirects`) are never renamed, whatever the list.

Default `rewrite`: `.html`, `.htm`, `.css`, `.svg`, `.js`, `.mjs`, `.json`, `.webmanifest`, `.xml`, `.txt`.

A glob without a slash matches the file name in any folder; one with a slash matches the path relative to `file.base`. Options are validated when the plugin is created: unknown keys, a `hashLength` out of range, an extension without its dot or a manifest path outside the output folder throw right away.

## Files and errors

- Every file with contents is held until the stream ends, then all are emitted in their original order (plus the manifest, last). Pass the whole site through one call: references to assets in another stream are not rewritten.
- Files without contents pass through at once. An empty stream emits nothing, not even the manifest.
- A file's contents are rewritten only when a reference in it changed, so text files that are not UTF-8 keep their bytes.
- Files on a reference cycle, and files that reference themselves, keep their names so every link stays valid.
- A renamed file's `sourceMap.file` follows its new name; `revOrigPath`, `revOrigBase` and `revHash` are set on it.
- Two files with the same path relative to their bases (from two `src` globs with different bases) emit a PluginError from `@zilero/gulp-asset-revision` naming both.

## Recipes

Keep more files under their names (list the defaults you want too, since `exclude` replaces them):

```ts
assetRevision({ exclude: ['*.html', '*.map', 'robots.txt', 'favicon.ico', 'img/og/**'] });
```

Only rename, and hand the manifest to a server-side template:

```ts
assetRevision({ rewrite: false, manifest: { path: 'meta/assets.json' } });
```

Shorter names:

```ts
assetRevision({ hashLength: 8 }); // main-3f2a9c1b.css
```

## Migrating from `gulp-rev` + `gulp-rev-rewrite`

| gulp-rev, gulp-rev-rewrite, gulp-rev-all         | @zilero/gulp-asset-revision                            |
| ------------------------------------------------ | ------------------------------------------------------ |
| `rev()` then `revRewrite({ manifest })`          | `assetRevision()`: one plugin, one pass                |
| `rev.manifest()` / `rev.manifest('assets.json')` | `manifest: true` / `manifest: { path: 'assets.json' }` |
| `rev.manifest({ merge: true })`                  | not supported: revise the whole site in one stream     |
| MD5, 10 characters                               | SHA-256, `hashLength` characters (10 by default)       |
| gulp-rev-all `dontRenameFile`                    | `exclude` (globs)                                      |
| gulp-rev-all `dontUpdateReference`               | `rewrite` (by extension)                               |
| `file.revOrigPath`, `file.revHash`               | set the same way, so gulp-rev-delete-original works    |

The package is new in 2.0.

## Requirements

- Node.js 22.13+
- gulp 5 (gulp 4 works)
- ESM with types; `require()` works through Node's `require(esm)`
- No engine: hashing with `node:crypto`, globs with picomatch 4

**[Documentation](https://zilero232.github.io/gulp-plugins-hub/plugins/asset-revision)** · [Changelog](./CHANGELOG.md) · [All plugins](https://github.com/Zilero232/gulp-plugins-hub) · [Issues](https://github.com/Zilero232/gulp-plugins-hub/issues)

MIT © Artemev Alexandr
