export const PLUGIN_NAME = '@zilero/gulp-js-squeezer';

/** Files the plugin minifies; everything else passes through. */
export const JS_EXTENSIONS = ['.js', '.mjs', '.cjs'];

/**
 * terser's `module` for extensions that say what the file is: `.mjs` is always an ES module, `.cjs` never.
 * `.js` can be either and keeps terser's default, `false`.
 */
export const MODULE_BY_EXTENSION: Readonly<Record<string, boolean>> = {
  '.mjs': true,
  '.cjs': false
};
