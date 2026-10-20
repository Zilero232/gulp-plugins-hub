---
url: /gulp-plugins-hub/guide/recipes.md
description: >-
  Short gulp 5 recipes with gulp-plugins-hub: incremental builds, responsive
  images, font subsetting and steps that run in one mode only.
---

# Recipes

## A complete site build

The [example project](/guide/example-project) is a static site built with every plugin: pages, styles, scripts, images and fonts, a dev server and a hashed, zipped release. Its page walks through each task.

## Incremental builds

* **In one watch session**, `src(globs, { since: lastRun(task) })` reads only the files changed since the task last ran. It suits tasks that copy files one to one.
* **Across runs** (restarting the dev server, running `gulp images` again), [file-changed](/plugins/file-changed) compares with what is already in the output folder. It suits slow work such as image and font encoding.
* Neither suits Sass, Pug or bundles, whose files depend on each other: rebuild their entry points.

## Responsive images

```js
src('src/images/photos/*.jpg', { encoding: false })
  .pipe(imageSqueezer({ formats: ['original', 'webp', 'avif'], widths: [480, 960, 1920] }))
  .pipe(dest('dist/images/photos'));
```

```html
<picture>
  <source type="image/avif" srcset="/images/photos/beach-480w.avif 480w, /images/photos/beach-960w.avif 960w" />
  <source type="image/webp" srcset="/images/photos/beach-480w.webp 480w, /images/photos/beach-960w.webp 960w" />
  <img src="/images/photos/beach-960w.jpg" srcset="/images/photos/beach-480w.jpg 480w" alt="" />
</picture>
```

## Only the glyphs a page needs

```js
src('src/fonts/Display.ttf', { encoding: false })
  .pipe(fontSwitcher({ formats: 'woff2', subset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' }))
  .pipe(dest('dist/fonts'));
```

## A step in one mode only

Plugins are plain functions, so a JavaScript condition decides when the whole stream takes the same path:

```ts
import { PassThrough } from 'node:stream';

const when = ({ condition, then }) => (condition ? then() : new PassThrough({ objectMode: true }));
```

Use [conditional](/plugins/conditional) when the decision depends on each file.
