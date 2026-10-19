# Architecture

How the packages are built, and why: each decision lists the options that were weighed. Read it before adding a package or changing how one is laid out.

## The monorepo

```text
apps/       docs (the VitePress site), example (a site built with every plugin; CI's integration test)
packages/   the published plugins and their factory, nothing else
tooling/    private config workspaces: typescript-config, tsdown-config, vitest-config
scripts/    repository scripts (publishing)
```

Layouts studied: Turborepo's examples keep internal config packages in `packages/` next to the shared code; create-t3-turbo moves them to `tooling/`. Here `packages/` holds what is published and the publish script and turbo filters rely on that, so configs go to `tooling/`. Being workspaces, a change to a config reaches its dependents through turbo's task graph, with no list of global files to keep in sync.

| Choice              | Picked                                  | Over                                  | Why                                                                                                                                                                           |
| ------------------- | --------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package manager     | bun workspaces with a `catalog`         | pnpm, npm workspaces                  | The toolchain of the sibling projects; the catalog keeps shared versions (zod, vinyl, typescript) in one place.                                                               |
| Task runner         | turbo                                   | `bun --filter`, nx                    | Caches build, typecheck and test per package, and orders builds by dependency (`^build`). nx brings far more than 17 small packages need.                                     |
| Build               | tsdown, ESM only, declarations, publint | tsup, unbuild, dual ESM + CJS         | tsdown is the maintained successor of tsup. ESM only: every supported Node (22.13+) loads ES modules with `require()`, so a CJS build would only add the dual-package hazard. |
| Source resolution   | the `@zilero/source` export condition   | building before testing, TS paths     | Typecheck and tests read the sources of sibling packages directly, while the published `exports` point at `dist/`.                                                            |
| Versioning, publish | changesets + `scripts/publish/`         | semantic-release, `changeset publish` | One changelog and version per package. `changeset publish` runs `npm publish`, which leaves `workspace:` and `catalog:` in the manifest; `bun pm pack` resolves them.         |
| Docs                | VitePress workspace in `apps/docs/`     | TypeDoc, a README per package only    | Guides and recipes, not only API listings; the docs workspace pins the vite 5 VitePress 1 needs, apart from the vite 8 of Vitest.                                             |

## A plugin package

Studied: rollup/plugins and autoprefixer (one file per unit, flat), vinyl-fs and unplugin (folders by concern), commit-jazzer (a folder per module with its own types, tests and index). A flat folder stops being readable past a handful of files, and a generic `helpers/` or `utils/` bucket hides what the parts do. So:

```text
packages/gulp-<name>/src/
├── index.ts                 public exports: the plugin (default and named) and its public types
├── <name>.ts                the plugin: parse options, create the stream, wire the parts together
├── <name>.schema.ts         options (zod), a JSDoc line on every option
├── <name>.types.ts          public types: hooks and what they receive
├── <name>.constants.ts      PLUGIN_NAME (the package name) and fixed values
├── _tests/<name>.test.ts    the plugin's behavior, through runPlugin
└── <concern>/               internal parts, named after what they do: rewrite/, bundle/, archive/
    ├── <unit>.ts            one exported function per file, named after it
    ├── <concern>.types.ts   the `XInput` types of its functions
    ├── index.ts
    └── _tests/              unit tests of the parts that have logic of their own
```

The root only ever holds the public surface: internal parts always live in a concern folder, even when there is one. A plugin with no internal parts (a thin wrapper around its engine) has no folder at all.

Scripts follow the same rules: `scripts/<name>/index.ts` is the entry, with its types, constants, one file per function and `_tests/`.

## Code style

- `type`, never `interface`; no `as` casts; two or more parameters become one object typed `XInput`. Exceptions kept on purpose: the factory's `transform(file, context)` and `runPlugin(stream, files)`, which follow the stream conventions plugin authors know.
- Exported functions are named arrow functions with an explicit return type and a JSDoc line.
- `if` always takes braces; a blank line separates the steps of a function.
- Hooks receive one object (`{ file }`, `{ content, file }`) and may return a promise.
- Established packages over hand-written helpers: remeda and ts-pattern are bundled into each package by tsdown.

## Gulp plugin rules

- Built on `createPlugin`: files without contents pass through, streamed contents are refused unless the plugin handles them, errors are emitted as PluginErrors with the file, files stay in order.
- Options are validated by `parseOptions` when the plugin is created. Callbacks are checked with `z.custom<Fn>(isFunction)`: `z.function()` wraps the callback and validates its result, which breaks async hooks.
- Plugins work on their own formats (extensions compared in lowercase) and pass everything else through.
- Plugins for binary formats call `assertBinaryContents` first, since gulp 5 reads files as UTF-8 by default.
- A new file made from another is a `file.clone()`; source maps follow renames (`sourceMap.file`) and changes (`applySourceMap`).
- gulp is never a dependency.

## Engines

Each plugin wraps the library that does its job best today. The alternatives below were compared on maintenance, output quality, install weight (native binaries) and weekly downloads (October 2026).

| Plugin          | Engine                                                                  | Alternatives considered                           | Why                                                                                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| js-squeezer     | terser                                                                  | esbuild, @swc/core, oxc-minify, uglify-js         | The most widely used minifier with a JS API (48M/week), pure JavaScript, the smallest output in most cases, input source maps. esbuild and oxc are faster but tuned for bundlers; uglify-js does not parse modern syntax.                                                       |
| css-squeezer    | Lightning CSS                                                           | cssnano + autoprefixer (PostCSS), clean-css, csso | Minifies, prefixes and lowers syntax for browserslist targets in one pass (115M/week). clean-css and csso have had no release since 2023; cssnano needs PostCSS and a second plugin for prefixes.                                                                               |
| html-squeezer   | html-minifier-next                                                      | html-minifier-terser, @minify-html/node           | The maintained successor of html-minifier-terser (no release since 2023), same options, presets. minify-html is faster but a native module with fewer options.                                                                                                                  |
| scss-compiler   | sass-embedded                                                           | sass (pure JS)                                    | Same API, several times faster, and one compiler process serves the whole stream. The pure-JS build would avoid a native binary but is slow on real projects.                                                                                                                   |
| pug-compiler    | pug 3                                                                   | —                                                 | The only implementation.                                                                                                                                                                                                                                                        |
| image-squeezer  | sharp                                                                   | imagemin plugins, @jsquash (WebAssembly)          | One maintained library for every format, resizing and orientation (71M/week). imagemin plugins download separate binaries that break often; jSquash is slower and has no resizing pipeline.                                                                                     |
| font-switcher   | harfbuzz (subset-font) + fontverter; fonteditor-core for legacy formats | fonteditor-core alone, fontmin                    | Tested on real fonts: fonteditor-core writes GPOS twice and drops GSUB and GDEF (ligatures and OpenType features gone), and the woff2 encoder rejects the result. harfbuzz subsetting and fontverter's container conversion keep every table. All WebAssembly, no native build. |
| archive-creator | archiver 8                                                              | yazl, JSZip, tar-stream                           | zip and tar from one streaming API, used by most Node archive tools.                                                                                                                                                                                                            |
| asset-revision  | built on node:crypto                                                    | rev-hash, gulp-rev + gulp-rev-rewrite             | Renaming and rewriting are one step here, so the hashes can follow the references between files.                                                                                                                                                                                |

## asset-revision: hashing order

A file's hash must cover its rewritten references, so a file is hashed after every asset it references. Options:

1. **Stages by extension** (images, then CSS, then JS) — breaks as soon as a stage references itself: CSS importing CSS, CSS pointing at SVG, JS importing JS.
2. **Rewrite and hash until nothing changes** — handles any order, but costs several passes over every file and never settles on a cycle.
3. **A reference graph** — scan each text file once for references to the other files, hash in topological order. Deterministic, one pass.

Picked: 3. A cycle (`a.js` imports `b.js`, which imports `a.js`) cannot have stable hashes in any order: whichever file is hashed first still points at the other's old name. Leaving the references as they are breaks both links, rewriting what is known breaks one and depends on order; so files on a cycle, and those waiting for it, keep their names. Every link stays valid; only their cache-busting is lost.

References resolve the way a browser does: `/img/a.png` from the base; `../img/a.png` and `./img/a.png` from the referencing file; a bare `img/a.png` from the file when that asset exists, else from the base (pages at the root, scripts that build URLs). The same `findReferences` builds the graph and rewrites the files, so the two cannot disagree.
