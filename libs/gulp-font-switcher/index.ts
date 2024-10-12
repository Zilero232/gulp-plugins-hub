import { Font } from "fonteditor-core";

import GulpPluginFactory from "@zilero/gulp-plugin-factory";
import GulpWinstonError from "@zilero/gulp-winston-error";

import { handleUnknownError } from "@shared/utils";
import { isObject, isString } from "@shared/helpers/typeHelpers";

import isFontFile from "./helpers/isFontFile";

import { PLUGIN_NAME } from "./constants";

import { GulpFontSwitcherOptions, FontTypeValues } from "./types";

/**
 * A Gulp plugin that can be used to transform and optimize font files.
 *
 * The plugin can accept several options to customize the behavior, such as
 * the format to convert from and to, the transformer function to use, and
 * other options to influence the conversion process.
 *
 * @param {GulpFontSwitcherOptions} options - An object containing the options to customize the behavior of the plugin.
 *
 * @returns {TransformStream} A Gulp plugin that can be used to transform and optimize font files.
 */
const GulpFontSwitcher = <T extends FontTypeValues>({ format, options, toBase64, optimize, sort, logStream, logEnd }: GulpFontSwitcherOptions<T>) => {
  // Checking for the presence of the options.
  if (options && !isObject(options)) {
    GulpWinstonError({
      pluginName: PLUGIN_NAME,
      message: "Transformer function is required and must be a function.",
    });
  }

  let fileCount = 0; // Counter of processed files.
  let processedCount = 0; // Counter of processed files.
  let errorCount = 0; // Error Counter.

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file: FileVinyl) => {
      // Defining the font type.
      const originalExtname = file.extname.toLowerCase();

      if (!isFontFile({ extname: originalExtname })) {
        GulpWinstonError({
          pluginName: PLUGIN_NAME,
          message: `File ${file.relative} is not a font to be skipped.`,
          options: {
            level: "warn",
          },
        });

        return null;
      }

      try {
        // Preparing the font buffer.
        let fontBuffer = file.contents;

        // Creating a font object.
        const font = Font.create(fontBuffer, { type: format.from, ...options?.create });

        // Converting the font to the required format.
        if (toBase64) {
          fontBuffer = Buffer.from(font.toBase64({ type: format.to, ...options?.write }));
        } else {
          const writtenFont = font.write({ type: format.to, ...options?.write });

          // Processing of possible types that font.write returns.
          switch (true) {
            case Buffer.isBuffer(writtenFont):
              fontBuffer = writtenFont; // If it's a Buffer.
              break;
            case isString(writtenFont):
              fontBuffer = Buffer.from(writtenFont); // Converting a string to a Buffer.
              break;
            case writtenFont instanceof ArrayBuffer:
              fontBuffer = Buffer.from(writtenFont); // Converting ArrayBuffer to Buffer.
              break;
            default:
              fontBuffer = null; // If the type does not match.
          }
        }

        // Updating file contents.
        file.contents = fontBuffer;

        // Changing the file extension.
        file.extname = format.to;

        // optimize glyphs.
        if (optimize) {
          font.optimize();
        }

        // sort glyphs.
        if (sort) {
          font.sort();
        }

        // Increasing the counter of processed files.
        fileCount++;

        if (fontBuffer) {
          // Increasing the counter of processed files.
          processedCount++;
        } else {
          // Increasing the count of missed files.
          errorCount++;
        }

        // Logging of successful file processing.
        if (logStream) {
          GulpWinstonError({
            pluginName: PLUGIN_NAME,
            message: `Transformed font file ${file.relative} from ${format.from} to ${format.to} - ${fontBuffer ? "successfully." : "failed."}.`,
            options: {
              level: "info",
            },
          });
        }

        return file;
      } catch (error: unknown) {
        return handleUnknownError({
          pluginName: PLUGIN_NAME,
          message: `An error occurred while processing ${file.relative}.`,
          error,
        });
      }
    },
    onFinish: () => {
      if (logEnd) {
        GulpWinstonError({
          pluginName: PLUGIN_NAME,
          message: `Processing complete. Total files: ${fileCount}, Total processed files: ${processedCount}, Total errors: ${errorCount}`,
          options: {
            level: "warn",
          },
        });
      }
    },
  });
};

export default GulpFontSwitcher;
