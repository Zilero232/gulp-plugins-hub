# Contributing

Thanks for helping. Bug reports, ideas and pull requests are welcome.

## Reporting a bug

Open an issue with the plugin and its version, the options and a few lines of gulpfile, what you expected and what happened (the full error), and your Node.js and gulp versions.

## Development

The toolchain is pinned in [`mise.toml`](mise.toml):

```sh
mise install
bun install
bun run test     # every package's tests, the example site built with the packages, the scripts' tests
bun run verify   # typecheck, lint, format, spelling, unused code
```

| Command                 | Does                                               |
| ----------------------- | -------------------------------------------------- |
| `bun run build`         | Builds every package (tsdown, checked by publint). |
| `bun run test:coverage` | Every package's tests with coverage thresholds.    |
| `bun run example`       | Builds the example site.                           |
| `bun run docs:dev`      | The documentation site with live reload.           |
| `bun run fix`           | Applies ESLint and Prettier fixes.                 |

## Adding or changing a plugin

1. Read [ARCHITECTURE.md](ARCHITECTURE.md): the package layout, the code style and the rules every plugin follows.
2. Follow the layout of an existing package: the public surface at the root of `src/` (`index.ts`, `<name>.ts`, `.schema.ts`, `.types.ts`, `.constants.ts`), internal parts in folders named after what they do.
3. Build it with `createPlugin` and `parseOptions` from `@zilero/gulp-plugin-factory`.
4. Test behavior, options validation and errors with `@zilero/gulp-plugin-factory/testing`; compare paths with `getRelativePath`, so the tests pass on Windows.
5. Document every option in `apps/docs/plugins/<name>.md` and the package README.
6. Add a changeset: `bun run changeset`.

## Commits and pull requests

Commits follow [Conventional Commits](https://www.conventionalcommits.org), checked by commitlint; `bun run commit` asks the questions for you. Before opening a pull request, run `bun run verify` and `bun run test`.

## Releases

Merging to `master` with changesets opens a "version packages" pull request; merging it publishes the changed packages to npm and creates the GitHub releases.

Publishing uses npm trusted publishing, which is configured on a package that already exists on npm. A new package is therefore published once by hand (`npm publish` of its `bun pm pack` tarball, with a maintainer's login), then given the release workflow as its trusted publisher in its npm settings.
