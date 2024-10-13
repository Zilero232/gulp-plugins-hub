import { minify } from "terser";

import GulpPluginFactory from "@zilero/gulp-plugin-factory";
import GulpWinstonError from "@zilero/gulp-winston-error";

import { handleUnknownError } from "@shared/utils";
import { isFunction, isString } from "@shared/helpers/typeHelpers";

import { PLUGIN_NAME } from "./constants";

import { GulpJsSqueezerOptions } from "./types";

/**
 * A Gulp plugin that can be used to minify JavaScript files.
 *
 * The plugin processes the JavaScript content of each file in the stream, minifying it
 * and logging the results. If the file is not a Buffer, it is skipped.
 *
 * The plugin also provides statistics on the number of files processed and the
 * number of errors encountered.
 *
 * @param {GulpJsSqueezerOptions} options - The options for the plugin.
 *
 * @returns {TransformStream} - A Gulp plugin that can be used to minify JavaScript files.
 *
 * @example
 * import GulpJsSqueezer from "@zilero/gulp-js-squeezer";
 *
 * gulp.src("src/*.js")
 *   .pipe(GulpJsSqueezer())
 *   .pipe(gulp.dest("dist"));
 */
const GulpJsSqueezer = ({
  logStream = false,
  logEnd = false,
  skipFilesWithoutExtension = true,
  onBeforeMinify,
  onAfterMinify,
  ...minifyOptions
}: GulpJsSqueezerOptions) => {
  // Checking the validity of the function onBeforeMinify.
  if (onBeforeMinify && !isFunction(onBeforeMinify)) {
    return GulpWinstonError({
      pluginName: PLUGIN_NAME,
      message: "OnBeforeMinify must be a function.",
    });
  }

  // Checking the validity of the function onAfterMinify.
  if (onAfterMinify && !isFunction(onAfterMinify)) {
    return GulpWinstonError({
      pluginName: PLUGIN_NAME,
      message: "OnAfterMinify must be a function.",
    });
  }

  let fileCount = 0; // Counter of processed files.
  let processedCount = 0; // Counter of processed files.
  let errorCount = 0; // Error Counter.

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file: FileVinyl) => {
      try {
        const isBuffer = file.isBuffer();

        // Skipping files without an extension .js (if enabled).
        if (skipFilesWithoutExtension && !file.extname.endsWith(".js")) {
          if (logStream) {
            GulpWinstonError({
              pluginName: PLUGIN_NAME,
              message: `Skipped file: ${file.relative} because it does not have an extension .js`,
              options: {
                level: "warn",
              },
            });
          }

          return file;
        }

        if (isBuffer) {
          // Get the content of the file.
          let content = file.contents.toString();

          // onBeforeMinify call (if passed).
          const onBeforeModified = onBeforeMinify ? await onBeforeMinify(content) : content;

          // Update the content of the file.
          if (onBeforeModified && isString(onBeforeModified)) {
            content = onBeforeModified;
          }

          // Minify the JS content.
          content = (await minify(content, minifyOptions)).code ?? "";

          // onAfterMinify call (if passed).
          const onAfterModified = onAfterMinify ? await onAfterMinify(content) : content;

          // Update the content of the file.
          if (onAfterModified && isString(onAfterModified)) {
            content = onAfterModified;
          }

          // Increasing the counter of processed files.
          processedCount++;

          // Update the contents of the file.
          file.contents = Buffer.from(content);
        } else {
          // Increasing the count of missed files.
          errorCount++;
        }

        if (logStream) {
          GulpWinstonError({
            pluginName: PLUGIN_NAME,
            message: `Minified JS file ${file.relative} ${isBuffer ? "successfully." : "failed."}.`,
            options: {
              level: "info",
            },
          });
        }

        // Increasing the counter of processed files.
        fileCount++;

        return file;
      } catch (error: unknown) {
        return handleUnknownError({
          pluginName: PLUGIN_NAME,
          message: `An error occurred while processing file ${file.relative}.`,
          error,
        });
      }
    },
    onFinish: () => {
      if (logEnd) {
        GulpWinstonError({
          pluginName: PLUGIN_NAME,
          message: `Total files: ${fileCount}, Total processed files: ${processedCount}, Total errors: ${errorCount} JS file(s).`,
          options: {
            level: "info",
          },
        });
      }
    },
  });
};

export default GulpJsSqueezer;
