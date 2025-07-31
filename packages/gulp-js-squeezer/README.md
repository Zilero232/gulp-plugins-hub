<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+JS+Squeezer;Powerful+%26+Flexible;Smart+JS+Minification" alt="Typing SVG" />

📦 Powerful Gulp plugin for JavaScript minification with Terser.

[Installation](#-installation) •
[Options](#-options) •
[Example](#-example)

</div>

## ✨ Features

- 📦 JavaScript minification using Terser
- 🔧 Highly configurable
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Progress logging
- 🛠️ Pre and post processing hooks

## 🚀 Installation

```bash
npm install @zilero/gulp-js-squeezer --save-dev
# or
yarn add @zilero/gulp-js-squeezer --dev
# or
pnpm add @zilero/gulp-js-squeezer --save-dev
```

## ⚙️ Options

### minifyOptions
- Type: `MinifyOptions`
- Required: `false`
- Terser minification options

### pluginOptions
- Type: `object`
- Required: `false`

#### pluginOptions.onBeforeMinify
- Type: `(content: string) => Promise<string> | string`
- Required: `false`
- Transform content before minification

#### pluginOptions.onAfterMinify
- Type: `(content: string) => Promise<string> | string`
- Required: `false`
- Transform content after minification

## 📝 Example

```typescript
gulp.task('advanced-minify', () => {
  return gulp.src('src/**/*.js')
    .pipe(GulpJsSqueezer({
      minifyOptions: {
        compress: {
          dead_code: true,
          drop_console: true
        },
        mangle: true
      },
      pluginOptions: {
        onBeforeMinify: (content) => {
          // Custom pre-processing
          return content;
        },
        onAfterMinify: (content) => {
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
