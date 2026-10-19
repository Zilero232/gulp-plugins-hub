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

Releases go through [changesets](https://github.com/changesets/changesets) and `.github/workflows/release.yml`:

1. A pull request that changes a published package includes a changeset: `bun run changeset`, pick the packages and the bump, describe the change for the changelog.
2. Merged to `master`, the release workflow opens (or updates) the "chore(release): 🔖 version packages" pull request, which bumps the versions and writes the changelogs.
3. Merging that pull request runs the workflow again: `scripts/publish/` publishes every package whose version is not on npm yet, dependencies first, with npm trusted publishing and provenance, then tags the versions and creates the GitHub releases.

### A new package

npm trusted publishing can only be set up for a package that already exists, so a new package's first version is published by hand, from the "version packages" branch, before that pull request is merged:

```sh
git switch changeset-release/master && git pull
npm login
bun install && bun run build
bun scripts/publish/index.ts --local --dry-run   # check what would be published
bun scripts/publish/index.ts --local
```

`--local` publishes with the maintainer's login and without provenance (which needs CI's OIDC token). Then, in its settings on the npm website, each new package gets a trusted publisher: repository `Zilero232/gulp-plugins-hub`, workflow `release.yml`. Merging the pull request afterwards publishes nothing twice: versions already on npm are skipped, and the workflow tags them and creates the releases.

### Repository settings the workflows need

- Settings → Actions → General: "Allow GitHub Actions to create and approve pull requests", for the "version packages" pull request.
- Settings → Pages: deploy from the `gh-pages` branch, created by the first run of the docs workflow.
