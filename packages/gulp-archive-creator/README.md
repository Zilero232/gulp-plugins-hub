<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Archive+Creator;Powerful+%26+Flexible;Type-Safe+%26+Stream-Based" alt="Typing SVG" />

🗄️ Powerful Gulp plugin for creating archives (zip, tar, etc.) from your stream files.

[Installation](#-installation) •
[Usage](#-usage) •
[Options](#-options) •
[Example](#-example)

</div>

## ✨ Features

- 📦 Support for multiple archive formats (zip, tar)
- 🔧 Highly configurable
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Progress logging
- 🛠️ Customizable compression options

## 🚀 Installation

```bash
npm install @zilero/gulp-archive-creator --save-dev
# or
yarn add @zilero/gulp-archive-creator --dev
# or
pnpm add @zilero/gulp-archive-creator --save-dev
```

## 📋 Usage

```typescript
import GulpArchiveCreator from "@zilero/gulp-archive-creator";

gulp.task('archive', () => {
  return gulp.src('src/**/*')
    .pipe(GulpArchiveCreator({
      format: 'zip',
      pluginOptions: {
        archiveName: 'my-archive'
      }
    }))
    .pipe(gulp.dest('dist'));
});
```

## ⚙️ Options

### format
- Type: `string`
- Required: `true`
- Default: `'zip'`
- Supported formats: `'zip'`, `'tar'`

### archiveOptions
- Type: `ArchiverOptions`
- Required: `false`
- Options from [archiver](https://www.npmjs.com/package/archiver) package

### pluginOptions
- Type: `object`
- Required: `false`

#### pluginOptions.archiveName
- Type: `string`
- Default: `'archive'`
- Archive name without extension

#### pluginOptions.createDirectory
- Type: `boolean`
- Default: `false`
- Create directory structure in archive

#### pluginOptions.createEmptyArchive
- Type: `boolean`
- Default: `false`
- Create archive even if no files were processed

#### pluginOptions.logProgress
- Type: `boolean`
- Default: `true`
- Log each file added to archive

#### pluginOptions.logFinal
- Type: `boolean`
- Default: `true`
- Log final statistics

## 📝 Example

```typescript
gulp.task('create-archive', () => {
  return gulp.src(['src/**/*', '!src/**/*.map'])
    .pipe(GulpArchiveCreator({
      format: 'zip',
      archiveOptions: {
        zlib: { level: 9 } // Maximum compression
      },
      pluginOptions: {
        archiveName: 'project-build',
        createEmptyArchive: false,
        logProgress: true
      }
    })
    .pipe(gulp.dest('dist'));
});
```

## 🤝 Contributing

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

If you would like to contribute to the project, please create a pull request or leave feedback. We are always open to new ideas and improvements!

## 🐛 Issues

[![GitHub Issues](https://img.shields.io/github/issues/zilero/gulp-plugins-hub.svg)](https://github.com/zilero/gulp-plugins-hub/issues)

Found a bug? Want to request a feature? Please create an issue.

## 📄 License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

This project is licensed under the MIT License. See the LICENSE file for details.

---

<div align="center">

Made with ❤️ by [Zilero](https://github.com/zilero)

</div>
