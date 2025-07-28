<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Refilename;Flexible+%26+Powerful;Smart+File+Renaming" alt="Typing SVG" />

📝 Powerful Gulp plugin for flexible file renaming with advanced pattern support.

[Installation](#-installation) •
[Usage](#-usage) •
[Options](#-options) •
[Example](#-example)

</div>

## ✨ Features

- 📄 Simple and complex file renaming
- 🎯 Prefix and suffix support
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Multiple extension handling
- 🛠️ Directory structure preservation

## 🚀 Installation

```bash
npm install @zilero/gulp-refilename --save-dev
# or
yarn add @zilero/gulp-refilename --dev
# or
pnpm add @zilero/gulp-refilename --save-dev
```

## 📋 Usage

```typescript
import GulpRefilename from "@zilero/gulp-refilename";

gulp.task('rename', () => {
  return gulp.src('src/**/*')
    .pipe(GulpRefilename({
      prefix: 'new-',
      suffix: '-min'
    }))
    .pipe(gulp.dest('dist'));
});
```

## ⚙️ Options

### Simple String
- Type: `string`
- Required: `false`
- Direct filename replacement

### Object Options
- Type: `object`
- Required: `false`

#### prefix
- Type: `string`
- Default: `''`
- Add prefix to filename

#### suffix
- Type: `string`
- Default: `''`
- Add suffix to filename

#### extname
- Type: `string`
- Default: `original extension`
- Change file extension

#### dirname
- Type: `string`
- Default: `original directory`
- Change directory path

#### multiExt
- Type: `boolean`
- Default: `false`
- Handle multiple extensions

## 📝 Example

```typescript
gulp.task('complex-rename', () => {
  return gulp.src('src/**/*')
    .pipe(GulpRefilename({
      prefix: 'processed-',
      suffix: '-v1',
      extname: '.min.js',
      multiExt: true
    }))
    .pipe(gulp.dest('dist'));
});

// Simple rename
gulp.task('simple-rename', () => {
  return gulp.src('src/**/*')
    .pipe(GulpRefilename('new-name.js'))
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
