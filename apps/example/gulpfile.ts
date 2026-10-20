// The public tasks: `gulp --tasks` lists them with their descriptions. The tasks themselves are in gulp/tasks/.
//
// gulp-cli loads this file through esbuild-register (a devDependency), which it finds on its own: Node's built-in
// TypeScript support is not registered for `require`, so gulp-cli would otherwise try a list of loaders first.
import gulp from 'gulp';

import { archive } from './gulp/tasks/archive.ts';
import { assets } from './gulp/tasks/assets.ts';
import { clean } from './gulp/tasks/clean.ts';
import { pages } from './gulp/tasks/pages.ts';
import { revision } from './gulp/tasks/revision.ts';
import { scripts } from './gulp/tasks/scripts.ts';
import { serve } from './gulp/tasks/serve.ts';
import { statics } from './gulp/tasks/statics.ts';
import { styles } from './gulp/tasks/styles.ts';

const compile = gulp.parallel(pages, styles, scripts, assets, statics);

export const build = gulp.series(clean, compile);
build.description = 'Build the site into dist/ (add --production for minified output)';

// The default task (`gulp`). No clean: images unchanged since the last run are not encoded again.
const dev = gulp.series(compile, serve);

dev.description = 'Build, serve with live reload and rebuild on change';

export const release = gulp.series(build, revision, archive);
release.description = 'Build for production, hash the asset names into release/site/ and zip it';

export { clean };

export default dev;
