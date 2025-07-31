<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+SCSS+Squeezer;Powerful+%26+Flexible;Smart+SCSS+Compilation" alt="Typing SVG" />

📦 Powerful Gulp plugin for SCSS compilation with embedded Sass compiler.

[Installation](#-installation) •
[Options](#-options) •
[Example](#-example)

</div>

## ✨ Features

- 📦 SCSS compilation using embedded Sass
- 🚀 High-performance processing
- 🗺️ Source maps support
- 🔧 Highly configurable
- 📝 TypeScript support
- 💡 Progress logging
- 🛠️ Pre and post processing hooks
- 🔄 Stream-based processing

## 🚀 Installation

```bash
npm install @zilero/gulp-scss-squeezer --save-dev
# or
yarn add @zilero/gulp-scss-squeezer --dev
# or
pnpm add @zilero/gulp-scss-squeezer --save-dev
```

## ⚙️ Options

### scssOptions
- Type: `Options<'sync'>` (sass-embedded options)
- Required: `false`
- Default: `{}`
- All options from sass-embedded are supported

### pluginOptions
- Type: `object`
- Required: `false`

#### pluginOptions.onBeforeCompile
- Type: `(content: string) => Promise<string>`
- Required: `false`
- Transform SCSS content before compilation

#### pluginOptions.onAfterCompile
- Type: `(content: string) => Promise<string>`
- Required: `false`
- Transform CSS content after compilation

## 📝 Example

```typescript
gulp.task('compile-scss', () => {
  return gulp.src('src/scss/**/*.scss')
    .pipe(GulpScssSqueezer({
      scssOptions: {
        style: 'compressed',
      },
      pluginOptions: {
        onBeforeCompile: async (content) => {
          // Custom pre-processing
          return content;
        },
        onAfterCompile: async (content) => {
          // Custom post-processing
          return content;
        }
      }
    }))
    .pipe(gulp.dest('dist/css'));
});

// With source maps
gulp.task('compile-scss-with-maps', () => {
  return gulp.src('src/scss/**/*.scss')
    .pipe(GulpScssSqueezer({
      scssOptions: {
        style: 'expanded',
        sourceMap: true,
        sourceMapIncludeSources: true
      }
    }))
    .pipe(gulp.dest('dist/css'));
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
