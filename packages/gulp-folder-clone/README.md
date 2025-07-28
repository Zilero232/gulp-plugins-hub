<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Folder+Clone;Simple+%26+Efficient;Type-Safe+Cloning" alt="Typing SVG" />

📂 Powerful Gulp plugin for cloning folders and files with transformation support.

[Installation](#installation) •
[Usage](#usage) •
[Options](#options) •
[Example](#example)

</div>

## ✨ Features

- 📁 Simple folder and file cloning
- 🔄 Custom file transformation support
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Progress logging
- 🛠️ Highly configurable

## 🚀 Installation

```bash
npm install @zilero/gulp-folder-clone --save-dev
# or
yarn add @zilero/gulp-folder-clone --dev
# or
pnpm add @zilero/gulp-folder-clone --save-dev
```

## 📋 Usage

```typescript
import GulpFolderClone from "@zilero/gulp-folder-clone";

gulp.task('clone', () => {
  return gulp.src('src/**/*')
    .pipe(GulpFolderClone({
      logFinish: true
    }))
    .pipe(gulp.dest('dist'));
});
```

## ⚙️ Options

### pluginOptions
- Type: `object`
- Required: `false`

#### pluginOptions.logFinish
- Type: `boolean`
- Default: `true`
- Log final statistics after cloning

#### pluginOptions.logProgress
- Type: `boolean`
- Default: `false`
- Log progress during cloning

#### pluginOptions.onBeforeCopy
- Type: `(file: Vinyl) => Promise<Vinyl> | Vinyl`
- Required: `false`
- Transform file before copying

## 📝 Example

```typescript
gulp.task('clone-with-transform', () => {
  return gulp.src('src/images/**/*')
    .pipe(GulpFolderClone({
      logFinish: true,
      onBeforeCopy: (file) => {
        // Custom transformation
        return file;
      }
    }))
    .pipe(gulp.dest('dist/images'));
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
