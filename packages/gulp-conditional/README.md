<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Conditional;Smart+%26+Flexible;Conditional+Processing" alt="Typing SVG" />

🔀 Powerful Gulp plugin for conditional stream processing.

[Installation](#installation) •
[Usage](#usage) •
[Options](#options) •
[Example](#example)

</div>

## ✨ Features

- 🔄 Conditional stream processing
- 🎯 Multiple condition handlers
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Default fallback handler
- 🛠️ Flexible condition system

## 🚀 Installation

```bash
npm install @zilero/gulp-conditional --save-dev
# or
yarn add @zilero/gulp-conditional --dev
# or
pnpm add @zilero/gulp-conditional --save-dev
```

## 📋 Usage

```typescript
import GulpConditional from "@zilero/gulp-conditional";

gulp.task('process', () => {
  return gulp.src('src/**/*')
    .pipe(GulpConditional({
      handlers: [
        {
          condition: () => process.env.NODE_ENV === 'production',
          handler: () => someProductionPlugin()
        }
      ]
    }))
    .pipe(gulp.dest('dist'));
});
```

## ⚙️ Options

### handlers
- Type: `Array<{ condition: boolean | () => boolean, handler: () => Transform }>`
- Required: `true`
- List of condition-handler pairs

### defaultHandler
- Type: `() => Transform`
- Required: `false`
- Default handler if no conditions match

## 📝 Example

```typescript
gulp.task('advanced-conditional', () => {
  return gulp.src('src/**/*')
    .pipe(GulpConditional({
      handlers: [
        {
          condition: () => process.env.NODE_ENV === 'production',
          handler: () => GulpJsSqueezer({
            minifyOptions: {
              compress: true
            }
          })
        },
        {
          condition: () => process.env.NODE_ENV === 'development',
          handler: () => GulpFileExclude({
            patterns: ['.min.']
          })
        }
      ],
      defaultHandler: () => GulpFileExclude({
        patterns: ['.test.']
      })
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
