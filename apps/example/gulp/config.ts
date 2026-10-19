import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { production: { type: 'boolean', default: false } }, strict: false });

/** `gulp build --production` (or NODE_ENV=production): minified, no source maps, AVIF images. */
export const production = values.production === true || process.env.NODE_ENV === 'production';

export const version: string = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

export const paths = {
  src: 'src',
  dist: 'dist',
  release: 'release',
  pages: { src: 'src/pages/**/*.pug', watch: 'src/**/*.pug' },
  styles: { src: 'src/scss/**/*.scss', watch: 'src/scss/**', dest: 'dist/css' },
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
