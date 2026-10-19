export const PLUGIN_NAME = '@zilero/gulp-scss-compiler';

/** The Sass syntax of each extension the plugin compiles; everything else passes through. */
export const SYNTAXES = { '.scss': 'scss', '.sass': 'indented' } as const;
