<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Montserrat&weight=700&size=35&duration=3000&pause=1000&color=CF4647&background=45FF0000&center=true&vCenter=true&width=600&height=70&lines=Gulp+Plugin+Factory;Powerful+%26+Flexible;Plugin+Creation+Made+Easy" alt="Typing SVG" />

🏭 Core factory for creating type-safe Gulp plugins with ease.

[Installation](#-installation) •
[Options](#-options) •
[Example](#-example)

</div>

## ✨ Features

- 🛠️ Easy plugin creation
- 🔒 Type-safe by design
- 📝 TypeScript support
- 🚀 Stream-based processing
- 💡 Error handling
- 🔄 Async support

## 🚀 Installation

```bash
npm install @zilero/gulp-plugin-factory --save-dev
# or
yarn add @zilero/gulp-plugin-factory --dev
# or
pnpm add @zilero/gulp-plugin-factory --save-dev
```

## ⚙️ Options

### pluginName
- Type: `string`
- Required: `true`
- Min length: 5 characters
- Plugin identifier for error messages

### onFile
- Type: `(file: Vinyl, encoding: string, stream: Transform) => Promise<Vinyl | void>`
- Required: `true`
- File transformation handler

### onFinish
- Type: `(stream: Transform) => Promise<void>`
- Required: `false`
- Stream completion handler

## 📝 Example

```typescript
import GulpPluginFactory from "@zilero/gulp-plugin-factory";

const createCustomPlugin = (options = {}) => {
  let fileCount = 0;

  return GulpPluginFactory({
    pluginName: 'CustomPlugin',
    onFile: async (file, encoding, stream) => {
      if (file.isBuffer()) {
        // Process file content
        const content = file.contents.toString();
        file.contents = Buffer.from(content.toUpperCase());
        
        fileCount++;
        return file;
      }
      
      // Skip non-buffer files
      return;
    },
    onFinish: async (stream) => {
      console.log(`Processed ${fileCount} files`);
    }
  });
};

// Usage
gulp.task('custom', () => {
  return gulp.src('src/**/*')
    .pipe(createCustomPlugin())
    .pipe(gulp.dest('dist'));
});
```

## 🔍 Advanced Usage

### Error Handling

```typescript
const pluginWithErrors = () => {
  return GulpPluginFactory({
    pluginName: 'ErrorHandler',
    onFile: async (file) => {
      try {
        // Your processing logic
        return file;
      } catch (error) {
        throw new Error(`Failed to process ${file.path}: ${error.message}`);
      }
    }
  });
};
```

### File Filtering

```typescript
const filterPlugin = () => {
  return GulpPluginFactory({
    pluginName: 'FileFilter',
    onFile: async (file) => {
      // Return void to skip file
      if (file.path.includes('.test.')) {
        return;
      }
      return file;
    }
  });
};
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
