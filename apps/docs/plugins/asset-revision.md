# asset-revision

Cache-busting for a whole site: renames assets after a hash of their contents (`main.css` → `main-3f2a9c1b7d.css`), rewrites the references to them in HTML, CSS, JavaScript and other text files, and can write a manifest. Pages and source maps keep their names.

```sh
npm install --save-dev @zilero/gulp-asset-revision
```

## Usage

```js
import { dest, src } from 'gulp';
import assetRevision from '@zilero/gulp-asset-revision';

export const revision = () =>
  src('build/**', { encoding: false })
    .pipe(assetRevision({ manifest: true }))
    .pipe(dest('release'));
```

Read with `encoding: false` so images and fonts stay intact: gulp 5 reads files as UTF-8 by default, which corrupts binary data. Text files are still rewritten.

To keep more files under their own names, list them with the defaults, because a given `exclude` replaces the default list:

```js
assetRevision({ exclude: ['*.html', '*.htm', '*.map', 'robots.txt', 'favicon.ico'] });
```

## Options

| Option       | Type                           | Default                        | Description                                                                                                                                            |
| ------------ | ------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hashLength` | `number`                       | `10`                           | Characters of the SHA-256 hash added to names, from 4 to 64.                                                                                           |
| `exclude`    | `string[]`                     | `['*.html', '*.htm', '*.map']` | Globs of files that keep their names; references inside them are still rewritten. Case does not matter. Replaces the default list.                     |
| `rewrite`    | `string[] \| false`            | see below                      | Extensions (with the dot) of text files whose references are rewritten, or `false` to only rename.                                                     |
| `manifest`   | `boolean \| { path?: string }` | `false`                        | Emit a JSON manifest of original to revised paths. `true` writes `rev-manifest.json`; `path` is relative to the output folder and must stay inside it. |

The default `rewrite` list is `.html`, `.htm`, `.css`, `.svg`, `.js`, `.mjs`, `.json`, `.webmanifest`, `.xml` and `.txt`. Unknown keys are an error when the plugin is created.

A glob without a slash matches the file name in any folder (`*.map` matches `js/app.js.map`); a glob with a slash matches the whole path relative to `file.base` (`img/**`). Dot files match too, and case is ignored: `*.html` matches `INDEX.HTML`.

## Hashing

The hash is the first `hashLength` hex characters of the SHA-256 of the file's contents, added before the extension: `css/main.css` becomes `css/main-3f2a9c1b7d.css`.

A file's hash covers its rewritten references, so a change to an image also changes the names of the stylesheets and scripts that use it. Each text file in the `rewrite` list is scanned once for references to the other assets, and the assets are hashed in that reference graph's topological order: every file after the assets it references, whatever the stream order. So CSS pointing at SVG, CSS importing CSS (`@import`) and JS importing JS are all covered; files that do not depend on each other keep their stream order.

Files on a reference cycle (`a.js` imports `b.js`, which imports `a.js`), the files that depend on them, and files that reference themselves (`new URL('./worker.js', import.meta.url)` in `worker.js`) cannot get a hash that covers their own new name, so they keep their names and every reference to them stays valid; only their cache-busting is lost. They are not in the manifest.

Excluded files (pages, maps) and files on a cycle are rewritten last, with every revised name known.

## Rewritten references

References resolve the way a browser does, and a rewritten reference is written the same way as before:

| Form          | Example in `css/main.css` | Resolved from                                             |
| ------------- | ------------------------- | --------------------------------------------------------- |
| root-relative | `/img/logo.png`           | the base                                                  |
| with `../`    | `../img/logo.png`         | the referencing file                                      |
| with `./`     | `./img/logo.png`          | the referencing file                                      |
| bare          | `img/logo.png`            | the referencing file when that file exists, else the base |

A reference starts at the start of the text or after a quote, a backtick, `(`, `=`, `,` or whitespace, optionally followed by `/` or `./`. It ends at the end of the text or before a quote, a backtick, whitespace, `)`, `,`, `;`, `?`, `#`, `\`, `<`, `>` or `}`. So:

- quoted and unquoted forms both work: `url(img/logo.png)`, `src="img/logo.png"`, and unquoted attributes in minified HTML such as `href=/css/main.css>`;
- query strings and hashes are kept: `img/logo.png?v=1` becomes `img/logo-3f2a9c1b7d.png?v=1`;
- lookalikes are left alone: `other/img/logo.png`, `img/logo.png.bak`, `https://cdn.example.com/img/logo.png`;
- a bare reference that reads the same relative to the file and relative to the base (`img/a.png` in `css/main.css`, with both `css/img/a.png` and `img/a.png` in the stream) points at the asset next to the file, as in a browser; falling back to the base covers pages at the root and scripts that build URLs;
- references to excluded files (`about.html`) are left as they are, since those files keep their names.
- a reference resolves to the file a browser would load even when that file is excluded: with an excluded `blog/logo.png` next to `blog/index.html`, `src="logo.png"` in that page stays as it is rather than pointing at a revised root `logo.png`.

## Manifest

With `manifest`, one more file is emitted after the others: a JSON object of original to revised paths, both relative to the base with `/` separators. Only renamed files are listed.

```json
{
  "img/logo.png": "img/logo-9a1f3c0b2e.png",
  "css/main.css": "css/main-3f2a9c1b7d.css"
}
```

## Notes

- Every file with contents is held until the stream ends, then all of them are emitted together in their original order. Pass the whole site through one call, typically from a build folder into a release folder: references to an asset that goes through another stream are not rewritten.
- Files without contents (directories, `read: false`) pass through at once. An empty stream emits nothing, not even the manifest.
- Extensions are compared in lowercase, in the files and in `rewrite`: `.CSS` files are rewritten like `.css` ones.
- References are rewritten in place: the contents of a renamed text file are those after rewriting.
- A renamed file's `sourceMap.file` follows its new name, so `dest(…, { sourcemaps: '.' })` writes the map for the revised file.
