<div align="center">

  <img src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp-2x.png" width="200" alt="Gulp Logo">
  
</div>

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Plugins+Hub;Stream+Processing+Made+Easy;Type-Safe+Gulp+Plugins" alt="Typing SVG" />

</div>

<div align="center">

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![Gulp](https://img.shields.io/badge/Gulp-Ready-cf4647.svg)](https://gulpjs.com)

</div>

<p align="center">
  <a href="#-about">About</a> •
  <a href="#-plugins">Plugins</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-features">Features</a> •
  <a href="#-example">Example</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-support">Support</a>
</p>

## 🎯 About

Welcome to **Gulp Plugins Hub** – a collection of powerful, type-safe Gulp plugins designed to supercharge your development workflow. Built with modern development practices in mind, our plugins offer seamless integration, exceptional performance, and extensive customization options.

## 📦 Plugins

### 🏭 Core Tools
- [**gulp-plugin-factory**](packages/gulp-plugin-factory/README.md) - Create type-safe Gulp plugins
- [**gulp-conditional**](packages/gulp-conditional/README.md) - Conditional stream processing

### 📁 File Management
- [**gulp-archive-creator**](packages/gulp-archive-creator/README.md) - Create archives from streams
- [**gulp-folder-clone**](packages/gulp-folder-clone/README.md) - Clone with transformations
- [**gulp-refilename**](packages/gulp-refilename/README.md) - Pattern-based renaming
- [**gulp-file-exclude**](packages/gulp-file-exclude/README.md) - Smart file filtering

### ⚡ Optimization
- [**gulp-js-squeezer**](packages/gulp-js-squeezer/README.md) - JavaScript optimization
- [**gulp-html-squeezer**](packages/gulp-html-squeezer/README.md) - HTML minification
- [**gulp-pug-compiler**](packages/gulp-pug-compiler/README.md) - Pug compilation

## 🚀 Installation

```bash
# Using npm
npm install @zilero/[plugin-name] --save-dev

# Using yarn
yarn add @zilero/[plugin-name] --dev

# Using pnpm
pnpm add @zilero/[plugin-name] --save-dev
```

## ✨ Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔒 **Type Safety** | Full TypeScript support with accurate types |
| 🚀 **Performance** | Optimized stream processing for speed |
| 📦 **Modularity** | Use only what you need |
| 🛠️ **Configurable** | Extensive options for customization |
| 📝 **Logging** | Detailed progress and error reporting |
| 🔄 **Hooks** | Pre/Post processing capabilities |

</div>

## 📝 Example

```typescript
import { src, dest } from 'gulp';

import GulpConditional from '@zilero/gulp-conditional';
import GulpJsSqueezer from '@zilero/gulp-js-squeezer';
import GulpArchiveCreator from '@zilero/gulp-archive-creator';

export const build = () => {
  return src('src/**/*.js')
    .pipe(GulpConditional({
      handlers: [{
        condition: () => process.env.NODE_ENV === 'production',
        handler: () => GulpJsSqueezer({
          minifyOptions: { compress: true }
        })
      }]
    }))
    .pipe(GulpArchiveCreator({
      format: 'zip',
      pluginOptions: {
        archiveName: 'build'
      }
    }))
    .pipe(dest('dist'));
};
```

## 📚 Documentation

Detailed documentation for each plugin is available in their respective directories. Click the plugin names above to learn more.

## 🤝 Contributing

We love your input! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

## 💬 Support

- 📫 [Report a bug](https://github.com/zilero/gulp-plugins-hub/issues)
- 💡 [Request a feature](https://github.com/zilero/gulp-plugins-hub/issues)
- 🤝 [Join our community](https://github.com/zilero/gulp-plugins-hub/discussions)

## 📄 License

MIT © [Zilero](LICENSE)

---

<div align="center">

### Show your support

⭐️ Star us on GitHub — it motivates us a lot!

Made with ❤️ by [Zilero](https://github.com/zilero)

</div>
