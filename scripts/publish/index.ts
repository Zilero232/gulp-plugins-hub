// Publishes every package whose version is not on npm yet, then tags the release. It is the `publish-script`
// of changesets/action (release.yml), run after `changeset version` has bumped the versions.
//
// Why not `changeset publish`: it runs `npm publish` in each folder, which leaves bun's `workspace:` and
// `catalog:` versions in the published package.json. Why not `bun publish`: it has no provenance and no npm
// trusted publishing. So `bun pm pack` builds the tarball (versions resolved) and `npm publish <tarball>`
// publishes it with trusted publishing and provenance (`publishConfig.provenance`).
//
// `bun scripts/publish --dry-run` packs everything and runs `npm publish --dry-run`: nothing is uploaded.
import { mkdir, rm } from 'node:fs/promises';
import { parseArgs } from 'node:util';

import { isPublished } from './is-published';
import { packWorkspace } from './pack-workspace';
import { publishTarball } from './publish-tarball';
import { PACK_DIR } from './publish.constants';
import { readWorkspaces } from './read-workspaces';
import { runCommand } from './run-command';
import { sortByDependencies } from './sort-by-dependencies';

const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } });
const dryRun = values['dry-run'];

await rm(PACK_DIR, { recursive: true, force: true });
await mkdir(PACK_DIR);

for (const workspace of sortByDependencies(await readWorkspaces())) {
  const { name, version } = workspace.manifest;

  if (isPublished(workspace.manifest)) {
    console.log(`${name}@${version} is already on npm`);
    continue;
  }

  publishTarball({ tarball: packWorkspace({ workspace, destination: PACK_DIR }), dryRun });
  console.log(`${dryRun ? 'Checked' : 'Published'} ${name}@${version}`);
}

// Always, even when nothing was published now: a run that published and then failed before tagging is
// completed by the next one. `changeset tag` skips versions that have a tag, and writes a git-tag event per new
// tag to the file in CHANGESETS_OUTPUT (set by changesets/action and inherited here), from which the action
// pushes the tags and creates the GitHub releases.
if (!dryRun) {
  runCommand({ command: 'bun', args: ['run', 'changeset', 'tag'] });
}
