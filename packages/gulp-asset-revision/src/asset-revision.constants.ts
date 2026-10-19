export const PLUGIN_NAME = '@zilero/gulp-asset-revision';

/** Files that keep their names: pages are entry points, and source maps follow the file they belong to. */
export const DEFAULT_EXCLUDE = ['*.html', '*.htm', '*.map'];

/** Text formats whose references to other assets are rewritten. */
export const DEFAULT_REWRITE_EXTENSIONS = [
  '.html',
  '.htm',
  '.css',
  '.svg',
  '.js',
  '.mjs',
  '.json',
  '.webmanifest',
  '.xml',
  '.txt'
];

export const DEFAULT_MANIFEST_PATH = 'rev-manifest.json';
