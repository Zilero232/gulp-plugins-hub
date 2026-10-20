export const PLUGIN_NAME = '@zilero/gulp-refilename';

/** Keys from gulp-rename and `path.parse` that users reach for, with the key that does the job here. */
export const KEY_HINTS: Readonly<Record<string, string>> = {
  basename: 'stem',
  name: 'stem',
  ext: 'extname',
  dir: 'dirname'
};
