// The config for this repo's commits: `bun run commit`. A scope per package (without the `gulp-` prefix),
// plus the parts of the repo around them.
import { defineConfig } from 'commit-jazzer';

export default defineConfig({
  scopes: [
    'plugin-factory',
    'archive-creator',
    'asset-revision',
    'conditional',
    'css-squeezer',
    'file-changed',
    'file-concat',
    'file-exclude',
    'folder-clone',
    'font-switcher',
    'html-squeezer',
    'image-squeezer',
    'js-squeezer',
    'pug-compiler',
    'refilename',
    'scss-compiler',
    'text-replace',
    'example',
    'docs',
    'deps',
    'ci',
    'release'
  ],
  availableCommitTypes: [
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
  ],
  aliases: {
    deps: { type: 'upgrade', component: 'deps', title: 'update dependencies' }
  }
});
