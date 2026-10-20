import { parseArgs } from 'node:util';

import packageJson from '../package.json' with { type: 'json' };

// gulp-cli has parsed the command line already; the tasks only need the mode, read once when the gulpfile loads.
const { values, positionals } = parseArgs({
  options: { production: { type: 'boolean', default: false } },
  strict: false
});

/**
 * Minified, no source maps, AVIF images: `gulp build --production`, NODE_ENV=production, or `gulp release`, which
 * is only ever a production build.
 */
export const production =
  values.production === true || process.env.NODE_ENV === 'production' || positionals.includes('release');

export const { version } = packageJson;

export const paths = {
  src: 'src',
  dist: 'dist',
  release: 'release',
  pages: { src: 'src/pages/**/*.pug', watch: 'src/**/*.pug' },
  // Only the entry stylesheets: the partials in the folders under src/scss/ are compiled through their `@use`.
  styles: { src: 'src/scss/*.scss', watch: 'src/scss/**', dest: 'dist/css' },
  scripts: { entry: 'src/js/main.js', vendor: 'src/js/vendor/*.js', watch: 'src/js/**', dest: 'dist/js' },
  assets: { src: 'src/{images,fonts}/**' },
  statics: { src: 'src/static/**' }
};

export const navigation = [
  { page: 'index', label: 'Home', href: '/index.html' },
  { page: 'about', label: 'About', href: '/about.html' },
  { page: 'services', label: 'Services', href: '/services.html' },
  { page: 'contact', label: 'Contact', href: '/contact.html' }
];
