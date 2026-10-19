---
'@zilero/gulp-archive-creator': major
'@zilero/gulp-asset-revision': major
'@zilero/gulp-conditional': major
'@zilero/gulp-css-squeezer': major
'@zilero/gulp-file-changed': major
'@zilero/gulp-file-concat': major
'@zilero/gulp-file-exclude': major
'@zilero/gulp-folder-clone': major
'@zilero/gulp-font-switcher': major
'@zilero/gulp-html-squeezer': major
'@zilero/gulp-image-squeezer': major
'@zilero/gulp-js-squeezer': major
'@zilero/gulp-plugin-factory': major
'@zilero/gulp-pug-compiler': major
'@zilero/gulp-refilename': major
'@zilero/gulp-scss-compiler': major
'@zilero/gulp-text-replace': major
---

Rewrite every package for gulp 5 and Node.js 22.13: ES modules built with tsdown, options validated when the plugin is created, flat hooks that get the file, errors emitted as PluginErrors with the file, and files without contents passed through. See the migration guide: https://zilero232.github.io/gulp-plugins-hub/guide/migration

New plugins: css-squeezer (Lightning CSS), image-squeezer (sharp), file-concat, text-replace, asset-revision and file-changed.
