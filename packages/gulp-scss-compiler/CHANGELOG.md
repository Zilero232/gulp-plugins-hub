# @zilero/gulp-scss-compiler

## 2.0.0

### Major Changes

- [#5](https://github.com/Zilero232/gulp-plugins-hub/pull/5) [`433e124`](https://github.com/Zilero232/gulp-plugins-hub/commit/433e1243540572f754c8d8ffde05a1ee47107579) Thanks [@Zilero232](https://github.com/Zilero232)! - Rewrite every package for gulp 5 and Node.js 22.13: ES modules built with tsdown, options validated when the plugin is created, flat hooks that get the file, errors emitted as PluginErrors with the file, and files without contents passed through. See the migration guide: https://zilero232.github.io/gulp-plugins-hub/guide/migration
  
  New plugins: css-squeezer (Lightning CSS), image-squeezer (sharp), file-concat, text-replace, asset-revision and file-changed.

### Patch Changes

- Updated dependencies [[`433e124`](https://github.com/Zilero232/gulp-plugins-hub/commit/433e1243540572f754c8d8ffde05a1ee47107579)]:
  - @zilero/gulp-plugin-factory@2.0.0

## 1.0.1

### Patch Changes

- 3559097: Added a new plugins, sass compiler and fonts convert
- Updated dependencies [3559097]
  - @zilero/gulp-plugin-factory@1.0.4
