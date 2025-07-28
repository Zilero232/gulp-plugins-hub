<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Pug+Compiler;Fast+%26+Flexible;Smart+Pug+Compilation" alt="Typing SVG" />

🏗️ Powerful Gulp plugin for Pug template compilation with hooks support.

[Installation](#installation) •
[Usage](#usage) •
[Options](#options) •
[Example](#example)

</div>

## ✨ Features

- 📄 Pug to HTML compilation
- 🔄 Pre and post compilation hooks
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Progress logging
- 🛠️ Full Pug options support

## 🚀 Installation

```bash
npm install @zilero/gulp-pug-compiler --save-dev
# or
yarn add @zilero/gulp-pug-compiler --dev
# or
pnpm add @zilero/gulp-pug-compiler --save-dev
```

## 📋 Usage

```typescript
import GulpPugCompiler from "@zilero/gulp-pug-compiler";

gulp.task('compile', () => {
  return gulp.src('src/**/*.pug')
    .pipe(GulpPugCompiler({
      pugOptions: {
        pretty: true
      }
    }))
    .pipe(gulp.dest('dist'));
});
```

## ⚙️ Options

### pugOptions
- Type: `Options` (from pug)
- Required: `false`
- Pug compilation options

### pluginOptions
- Type: `object`
- Required: `false`

#### pluginOptions.logProgress
- Type: `boolean`
- Default: `true`
- Log each file compilation

#### pluginOptions.logFinal
- Type: `boolean`
- Default: `true`
- Log final statistics

#### pluginOptions.onBeforeCompile
- Type: `(content: string) => Promise<string> | string`
- Required: `false`
- Transform content before compilation

#### pluginOptions.onAfterCompile
- Type: `(content: string) => Promise<string> | string`
- Required: `false`
- Transform content after compilation

## 📝 Example

```typescript
gulp.task('advanced-compile', () => {
  return gulp.src('src/**/*.pug')
    .pipe(GulpPugCompiler({
      pugOptions: {
        pretty: true,
        doctype: 'html',
        locals: {
          title: 'My Website'
        }
      },
      pluginOptions: {
        logProgress: true,
        onBeforeCompile: (content) => {
          // Custom pre-processing
          return content;
        },
        onAfterCompile: (content) => {
          // Custom post-processing
          return content;
        }
      }
    }))
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
