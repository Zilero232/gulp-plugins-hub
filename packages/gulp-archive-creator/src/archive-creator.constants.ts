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

/**
 * The date of entries from files without a stat (made by other plugins), so the same files always give the same
 * archive. Noon UTC keeps it on 1 January 1980, the earliest date zip can store, in every time zone (zip stores
 * local time).
 */
export const FALLBACK_MODIFIED_TIME = new Date('1980-01-01T12:00:00Z');
