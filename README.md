**Gulp Plugins Hub v1.0.0**

***

# 🌟 Gulp Plugins Hub

Welcome to the world of Gulp plugins by Zilero! 🎉 This package is built on nx.js and provides a powerful set of tools to enhance your workflow. Each plugin is designed to simplify various tasks in the build and development process, allowing you to focus on creating amazing projects.

## 📦 Install the Package

To install the plugin, use the following command:

```bash
npm install gulp-conditional
```

## 🛠️ Available Plugins

Вот краткий обзор доступных плагинов и их функциональности:

- **gulp-conditional**: Allows you to conditionally run Gulp tasks based on specified conditions. 🎭

- **gulp-folder-clone**: Clones folders, making it convenient for backups or working with templates. 📁

- **gulp-font-switcher**: Converts fonts, simplifying font switching in your project and allowing for quick style changes. 🔤

- **gulp-html-squeezer**: Compresses HTML files, reducing their size and improving performance. ⚡️

- **gulp-js-squeeze**: Optimizes JavaScript by removing unnecessary code and comments. 🚀

- **gulp-plugin-factory**: Allows you to create custom Gulp plugins with minimal effort. 🏗️

- **gulp-plugin-manager**: Manages your plugins, simplifying their integration and configuration. 🛠️

- **gulp-pug-compiler**: Compiles Pug templates into HTML, enhancing code readability and maintainability. 📄

- **gulp-refilename**: Allows you to rename files during the build process. 🔄

- **gulp-scss-squeezer**: Optimizes SCSS files for reduced size and improved load speed. 🎨

- **gulp-sharper**: Enhances image quality by reducing their size without loss of quality. 🖼️

- **gulp-smart-changes**: Tracks file changes, processes only modified files, and automatically restarts Gulp tasks. 🔄

- **gulp-zip-creator**: Creates ZIP archives from your files and folders for convenient storage and transfer. 📦

- **gulp-winston-logger**: Integrates Winston for error handling and logging in your Gulp tasks. 📝

## 📚 Documentation

Each plugin has its own documentation detailing usage and examples. Refer to the documentation in the respective repositories for more information.

## 🚀 Example Usage

Here’s an example of how you can use one of the plugins in your `gulpfile.js`:

```javascript
const gulp = require("gulp");
const htmlSqueezer = require("gulp-html-squeezer");

gulp.task("compress-html", () => {
  return gulp.src("src/**/*.html").pipe(htmlSqueezer()).pipe(gulp.dest("dist"));
});
```

## 🤝 Contributing

If you would like to contribute to the project, please create a pull request or leave feedback. I am always open to new ideas and improvements!

## 💬 Community

Discuss the plugins with other users in GitHub Issues or in our chat.

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## Thank you for using the Gulp Plugins Hub by Zilero! 🌟 Your feedback and suggestions will help us make them even better!
