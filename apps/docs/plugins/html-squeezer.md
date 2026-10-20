---
description: Minify HTML in a gulp stream with html-minifier-next presets, inline CSS and JavaScript included.
---

# html-squeezer

Minifies HTML with html-minifier-next, starting from one of its presets: comments and redundant attributes go, and the `comprehensive` preset also minifies inline CSS, JavaScript and SVG. Other files pass through.

```sh
npm install --save-dev @zilero/gulp-html-squeezer
```

## Usage

```js
import { dest, src } from 'gulp';
import htmlSqueezer from '@zilero/gulp-html-squeezer';

export const html = () =>
  src('dist/**/*.html')
    .pipe(htmlSqueezer({ preset: 'comprehensive' }))
    .pipe(dest('dist'));
```

Options from `htmlMinifierOptions` are applied over the preset, and the hooks change the markup around the minifier:

```js
htmlSqueezer({ preset: 'comprehensive', htmlMinifierOptions: { removeAttributeQuotes: false } }); // keep quotes
htmlSqueezer({ preset: false, htmlMinifierOptions: { removeComments: true } }); // only what you list
htmlSqueezer({ onAfterMinify: ({ content, file }) => `<!-- ${file.basename} -->\n${content}` });
```

## Options

| Option                | Type                                               | Default          | Description                                                                                                                                |
| --------------------- | -------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `preset`              | `'conservative' \| 'comprehensive' \| false`       | `'conservative'` | The html-minifier-next preset to start from. `conservative` is safe for any page, `comprehensive` gives the smallest output, `false` none. |
| `htmlMinifierOptions` | `MinifierOptions`                                  | —                | html-minifier-next options as an object, applied over the preset.                                                                          |
| `onBeforeMinify`      | `({ content, file }) => string \| Promise<string>` | —                | Runs on the markup before minification and returns the markup to minify.                                                                   |
| `onAfterMinify`       | `({ content, file }) => string \| Promise<string>` | —                | Runs on the minified markup and returns the final markup.                                                                                  |

Unknown keys, an unknown preset and an `htmlMinifierOptions` that is not an object are an error when the plugin is created.

## Hooks

Both hooks get `{ content, file }` and return the markup to continue with, or a promise of it. A hook that returns anything else, say a JavaScript hook that forgets its `return`, fails the file with `onAfterMinify must return the text as a string, got undefined`. Their types are exported from the package: `import type { ContentHook } from '@zilero/gulp-html-squeezer'`.

## Notes

- Only `.html` and `.htm` files are minified, in any case (`INDEX.HTML` too). Other files, and files without contents (`read: false`), pass through untouched.
- `.xhtml` files pass through as well: the presets drop closing slashes and attribute values, which XHTML served as XML does not allow.
- html-minifier-next makes no source maps. A file that arrives with one, from `src(…, { sourcemaps: true })` or a template compiler, has it removed (`file.sourceMap` becomes `undefined`): it would point at markup that no longer exists. `dest` then writes no map for the file, and changes made in `onAfterMinify` have no map to follow either.
- An error from the minifier or a hook, such as markup it cannot parse (`<p <b>` gives `Parse error at line 1, column 1`), emits a PluginError with the file path.
- The minifier is [html-minifier-next](https://github.com/j9t/html-minifier-next); every one of its options goes through `htmlMinifierOptions`.

## Migrating

### From gulp-htmlmin

| gulp-htmlmin                       | html-squeezer                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `htmlmin(options)`                 | `htmlSqueezer({ preset: false, htmlMinifierOptions: options })` for the same output |
| `htmlmin()`, which barely minifies | `htmlSqueezer()`: the `conservative` preset                                         |
| html-minifier options              | html-minifier-next keeps html-minifier's option names                               |
| runs on every file in the stream   | only `.html` and `.htm`; other files pass through                                   |

### From 1.x

- html-minifier-terser 7, which is no longer maintained, is replaced by html-minifier-next 9.
- 1.x had no defaults, so without options it barely minified anything. Now the `conservative` preset applies by default; `preset: false` with your own `htmlMinifierOptions` gets the old behavior.
- The hooks moved from `pluginOptions` to the top level and get `{ content, file }` instead of the content alone.
- Only HTML files are processed; 1.x ran the minifier on every file in the stream.

See [migrating from 1.x](/guide/migration) for every package.
