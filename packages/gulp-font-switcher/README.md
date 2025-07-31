<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Font+Switcher;Powerful+%26+Flexible;Smart+Font+Conversion" alt="Typing SVG" />

📦 Powerful Gulp plugin for font format conversion with Fontmin.

[Installation](#-installation) •
[Options](#-options) •
[Example](#-example)

</div>

## ✨ Features

- 📦 Font format conversion using Fontmin
- 🔄 Input formats: TTF, OTF, SVG only
- 📤 Convert to TTF, WOFF, WOFF2, EOT, SVG
- 🔧 Font subsetting and optimization
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Automatic format detection

## 🚀 Installation

```bash
npm install @zilero/gulp-font-switcher --save-dev
# or
yarn add @zilero/gulp-font-switcher --dev
# or
pnpm add @zilero/gulp-font-switcher --save-dev
```

## ⚙️ Options

### pluginOptions
- Type: `object`
- Required: `true`

#### pluginOptions.format
- Type: `'ttf' | 'woff' | 'woff2' | 'eot' | 'svg'`
- Required: `true`
- Output font format to convert to

### fontOptions
- Type: `object`
- Required: `false`

#### fontOptions.glyph
- Type: `object`
- Required: `false`
- Font subsetting options:
  - `text`: `string` - Characters to include in the font subset
  - `basicText`: `boolean` - Add basic ASCII chars (default: false)
    - Basic chars: `!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_\`abcdefghijklmnopqrstuvwxyz{|}`
  - `hinting`: `boolean` - Keep font hinting (default: true)
  - `use`: `Function` - Custom Fontmin plugin

## 📝 Example

```typescript
gulp.task('convert-fonts', () => {
  return gulp.src('src/fonts/*.{ttf,otf,svg}') // Only these formats are supported!
    .pipe(GulpFontSwitcher({
      pluginOptions: {
        format: 'woff2'
      },
      fontOptions: {
        glyph: {
          text: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          basicText: true,
          hinting: true
        }
      }
    }))
    .pipe(gulp.dest('dist/fonts'));
});

// Convert multiple formats
gulp.task('build-fonts', () => {
  const formats = ['woff2', 'woff', 'ttf'];
  
  return Promise.all(formats.map(format => {
    return gulp.src('src/fonts/*.ttf')
      .pipe(GulpFontSwitcher({
        pluginOptions: { format }
      }))
      .pipe(gulp.dest(`dist/fonts/${format}`));
  }));
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
