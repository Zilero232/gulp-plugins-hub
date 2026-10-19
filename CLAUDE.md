# gulp-plugins-hub

Typed gulp 5 plugins, published to npm as `@zilero/gulp-*`, plus the factory they are built with. Bun-workspaces monorepo orchestrated by turbo; every package is ESM for Node 22.13+, built with tsdown.

Read [ARCHITECTURE.md](ARCHITECTURE.md) before structural changes: the package layout, the code style and why each engine was picked.

## Layout

| Path                           | What                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/gulp-plugin-factory` | `createPlugin`, `parseOptions`, source map, binary and path helpers; `./testing` has `createFile`, `runPlugin`, `getContents`, `getRelativePath`                                                                         |
| `packages/gulp-*`              | One plugin each, built on the factory                                                                                                                                                                                    |
| `apps/example/`                | A site built with every plugin, set up the way a 2026 gulp build is (`gulpfile.ts` loaded by esbuild-register, tasks in `gulp/tasks/`); its `test` runs a production release on the built packages and checks the output |
| `apps/docs/`                   | The VitePress site (pages, `.vitepress/config.ts`, `public/`), deployed to GitHub Pages                                                                                                                                  |
| `tooling/`                     | Private config workspaces every package uses: `typescript-config` (base.json), `tsdown-config`, `vitest-config`                                                                                                          |
| `scripts/publish/`             | Publishing for changesets/action: `bun pm pack` + `npm publish` per unpublished package, dependencies first                                                                                                              |

## Commands

- `bun run verify`: turbo typecheck + root tsc + ESLint + Prettier + cspell + knip; `bun run fix` applies lint and format fixes
- `bun run test`: Vitest in every package through turbo, the example's integration test (it builds the packages first) and the scripts' tests. Never bare `bun test`
- `bun run test:coverage`: every package at once with coverage thresholds
- `bun run build` builds `packages/*`; `bun run example`; `bun run docs:dev` / `docs:build`
- `bun run changeset` before a PR that changes a published package; `bun run commit` commits with commit-jazzer
- Toolchain from `mise.toml` (Node 22.18+ for development; the packages support 22.13)

## Code

- A package's `src/` root is its public surface (`index.ts`, `<name>.ts`, `.schema.ts`, `.types.ts`, `.constants.ts`, `_tests/`); internal parts live in folders named after what they do (`rewrite/`, `archive/`), one exported function per file, `XInput` types in `<folder>.types.ts`, an `index.ts` and `_tests/`
- Plugins use `createPlugin` and `parseOptions` from the factory and never depend on gulp. Callbacks in schemas are `z.custom<Fn>(isFunction)`: `z.function()` wraps and breaks async hooks
- `type`, never `interface`; no `as` casts; two or more parameters become one `XInput` object (exceptions: the factory's `transform(file, context)` and `runPlugin(stream, files)`); explicit return types; braces on every `if`; a blank line between steps
- Hooks take one object (`{ file }`, `{ content, file }`) and may return a promise
- Plugins filter by extension (lowercased) and pass other files through; binary plugins call `assertBinaryContents`
- Source maps: `applySourceMap` stores a tool's map; tools that cannot take an input map use `chain: true`; `getChainableSourceMap` for remapping several maps
- Untyped CommonJS libraries are loaded with `createRequire` into typed constants (`vendor/`), never with ambient `declare module`: sibling packages typecheck these sources
- Workspace packages resolve to sources through the `@zilero/source` export condition (tsconfig `customConditions` in `tooling/typescript`, `tooling/vitest`), so typecheck and tests need no build
- Tests compare paths with `getRelativePath(file)` and build absolute ones with `path.join`, so they pass on Windows
- JSDoc globs: write `**\/*.js`, since `*/` ends the comment

## Content and commits

- Code, comments, docs and commits in English; respond to the user in Russian
- Every option change updates the plugin's docs page (`apps/docs/plugins/<name>.md`) and README
- Conventional Commits with commit-jazzer types, enforced by commitlint. Don't commit or push unless asked
