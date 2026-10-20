// The config for this repo's commits: `bun run commit`. A scope per package (its folder without the `gulp-`
// prefix, read from packages/ so a new package needs no edit here), plus the parts of the repo around them.
// commitlint.config.ts allows the same types.
import { defineConfig } from 'commit-jazzer';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const packageScopes = readdirSync(path.join(import.meta.dirname, 'packages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('gulp-'))
  .map((entry) => entry.name.replace(/^gulp-/, ''))
  .sort();

export const COMMIT_TYPES = [
  'feat',
  'fix',
  'refactor',
  'perf',
  'chore',
  'docs',
  'test',
  'build',
  'ci',
  'security',
  'upgrade',
  'downgrade',
  'remove',
  'revert'
] as const;

export default defineConfig({
  scopes: [...packageScopes, 'example', 'docs', 'deps', 'ci', 'release'],
  availableCommitTypes: [...COMMIT_TYPES],
  aliases: {
    deps: { type: 'upgrade', component: 'deps', title: 'update dependencies' }
  }
});
