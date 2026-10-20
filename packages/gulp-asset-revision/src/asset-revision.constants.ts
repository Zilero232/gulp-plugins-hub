export const PLUGIN_NAME = '@zilero/gulp-asset-revision';

/**
 * Files that keep their names: pages are entry points, source maps follow the file they belong to, and the rest
 * are fetched at fixed URLs by browsers, crawlers and hosts (robots.txt, the favicon, sitemaps, service workers,
 * web app manifests, `.well-known/`). Files without an extension (`CNAME`, `.htaccess`) are never renamed.
 */
export const DEFAULT_EXCLUDE = [
  '*.html',
  '*.htm',
  '*.map',
  'robots.txt',
  'humans.txt',
  'ads.txt',
  'favicon.ico',
  'apple-touch-icon*.png',
  'browserconfig.xml',
  'sitemap*.xml',
  'sw.js',
  'service-worker.js',
  '*.webmanifest',
  '.well-known/**'
];

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
