export const PLUGIN_NAME = '@zilero/gulp-html-squeezer';

/**
 * Files the plugin minifies; everything else passes through. Not `.xhtml`: the presets drop closing slashes and
 * attribute values, which XHTML served as XML does not allow.
 */
export const HTML_EXTENSIONS = ['.html', '.htm'];

export const PRESET_NAMES = ['conservative', 'comprehensive'] as const;
