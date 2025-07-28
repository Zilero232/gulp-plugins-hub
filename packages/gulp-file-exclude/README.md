<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+File+Exclude;Smart+%26+Flexible;Pattern+Based+Filtering" alt="Typing SVG" />

🚫 Powerful Gulp plugin for excluding files based on patterns and conditions.

[Installation](#-installation) •
[Usage](#-usage) •
[Options](#-options) •
[Example](#-example)

</div>

## ✨ Features

- 📋 Pattern-based exclusion
- 📏 Size-based filtering
- 🔄 Custom exclusion functions
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Progress logging

## 🚀 Installation

```bash
npm install @zilero/gulp-file-exclude --save-dev
# or
yarn add @zilero/gulp-file-exclude --dev
# or
pnpm add @zilero/gulp-file-exclude --save-dev
```

## 📋 Usage

```typescript
import GulpFileExclude from "@zilero/gulp-file-exclude";

gulp.task('filter', () => {
  return gulp.src('src/**/*')
    .pipe(GulpFileExclude({
      patterns: ['.test.', '.spec.'],
      size: [1000, 1000000] // 1KB to 1MB
    }))
    .pipe(gulp.dest('dist'));
});
```

## ⚙️ Options

### patterns
- Type: `(string | RegExp)[]`
- Required: `false`
- Default: `[]`
- Patterns to match for exclusion

### size
- Type: `[number?, number?]`
- Required: `false`
- Default: `[]`
- File size limits [min, max] in bytes

### logExcluded
- Type: `boolean`
- Default: `true`
- Log excluded files statistics

### onExclude
- Type: `(file: Vinyl) => Promise<boolean>`
- Required: `false`
- Custom exclusion function

## 📝 Example

```typescript
gulp.task('advanced-filter', () => {
  return gulp.src('src/**/*')
    .pipe(GulpFileExclude({
      patterns: [
        '.test.',
        /\.spec\./,
        'temp-',
        /-draft\./
      ],
      size: [
        1024,    // min 1KB
        1048576  // max 1MB
      ],
      logExcluded: true,
      onExclude: async (file) => {
        // Custom exclusion logic
        return file.stat?.size > 5000000; // Exclude files > 5MB
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
