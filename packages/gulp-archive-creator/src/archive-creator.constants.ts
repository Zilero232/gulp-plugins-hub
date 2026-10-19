export const PLUGIN_NAME = '@zilero/gulp-archive-creator';

export const ARCHIVE_FORMATS = ['zip', 'tar', 'tgz'] as const;

/** The extension each format gets when `name` has none. */
export const FORMAT_EXTENSIONS = { zip: '.zip', tar: '.tar', tgz: '.tar.gz' } as const;

/** Extensions that decide the format, the longest first. */
export const EXTENSION_FORMATS = [
  ['.tar.gz', 'tgz'],
  ['.tgz', 'tgz'],
  ['.tar', 'tar'],
  ['.zip', 'zip']
] as const;
