import GulpPluginFactory from "@zilero/gulp-plugin-factory";
import GulpWinstonError from "@zilero/gulp-winston-error";

import { handleUnknownError } from "@shared/utils";

import { checkHashMatch, compareFileAttributes } from "./utils";

import { loadCache } from "./helpers/cache";
import getTargetPath from "./helpers/getTargetPath";

import { GulpSmartChangesOptions, CacheType } from "./types";

import { PLUGIN_NAME, CACHE_FILE_NAME } from "./constants";

/**
 * A Gulp plugin that can be used to compare the source and destination files in a project.
 *
 * The plugin can be used to compare the source and destination files in a project based on a
 * set of options. The plugin logs information about the files that are processed and
 * provides statistics on the number of files processed and the number of errors encountered.
 *
 * @param {GulpSmartChangesOptions} options - The options for the plugin.
 *
 * @returns {TransformStream} - A Gulp plugin that can be used to compare the source and destination files in a project.
 *
 * @example
 * import GulpSmartChanges from "@zilero/gulp-smart-changes";
 *
 * gulp.src("src/*.js")
 *   .pipe(GulpSmartChanges())
 *   .pipe(gulp.dest("dist"));
 */
const GulpSmartChanges = ({
  targetDirectory = "dist",
  ignorePatterns = [],
  comparisonOptions = {},
  cacheOptions = {},
  logStream = true,
  logEnd = true,
}: GulpSmartChangesOptions) => {
  let cache = new Map<string, string>();

  const { compareByHash = true, compareByName = false, compareByExtension = false, compareByMtime = false } = comparisonOptions;
  const { cacheEnabled = true, cacheFilePath = `gulp-cache/${CACHE_FILE_NAME}`, cacheType = CacheType.File } = cacheOptions;

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file: FileVinyl) => {
      try {
        const isBuffer = file.isBuffer();

        // Checking if the file needs to be excluded.
        if (ignorePatterns.some((pattern) => file.relative.includes(pattern))) {
          return null;
        }

        // Checking if the cache is enabled and if the cache type is file, then load the cache.
        if (cacheEnabled && cacheType === CacheType.File) {
          cache = await loadCache({ cacheFilePath });
        }

        // Get the target path for destination file.
        const destinationTargetPath = getTargetPath({
          pathRelative: file.relative,
          destination: targetDirectory,
        });

        // If user enabled compare by hash, match the hash.
        if (isBuffer && compareByHash) {
          const hashMatched = await checkHashMatch({
            filePath: file.path,
            fileContents: file.contents.toString(),
            cache,
            options: { cacheEnabled },
          });

          if (hashMatched) {
            return file;
          }
        }

        // If user enabled to compare files by name, extension or mtime.
        if (compareByName || compareByExtension || compareByMtime) {
          const fileCompared = await compareFileAttributes({
            filePath: file.path,
            destinationPath: destinationTargetPath,
            fileStatMtimeMs: file.stat?.mtimeMs ?? 0,
            options: { compareByName, compareByExtension, compareByMtime },
          });

          if (fileCompared) {
            return file;
          }
        }

        if (logStream) {
          GulpWinstonError({
            pluginName: PLUGIN_NAME,
            message: `Processed file: ${file.relative}`,
            options: {
              level: "info",
            },
          });
        }

        return file;
      } catch (error: unknown) {
        return handleUnknownError({
          pluginName: PLUGIN_NAME,
          message: "An error occurred while processing files.",
          error,
        });
      }
    },
    onFinish: () => {
      if (logEnd) {
        GulpWinstonError({
          pluginName: PLUGIN_NAME,
          message: "No files were processed.",
          options: {
            level: "warn",
          },
        });
      }
    },
  });
};

export default GulpSmartChanges;
