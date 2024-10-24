import { findUp, pathExistsSync } from "find-up";

import GulpWinstonError from "@zilero/gulp-winston-error";

import { PLUGIN_NAME, SEARCH_FILE } from "../constants";

interface FindPackageJsonProps {
  configPath?: string;
  cwd?: string;
}

/**
 * Search for the nearest package.json file in the specified path or the current working directory.
 *
 * @param {FindPackageJsonProps} [props] - The search options.
 * @param {string} [props.configPath] - The path to the package.json file to search for.
 * @param {string} [props.cwd] - The current working directory.
 *
 * @returns {Promise<string | null>} - The path to the found package.json file or null if not found.
 */
const findPackageJson = async ({ configPath, cwd }: FindPackageJsonProps): Promise<string | null> => {
  // If the path is specified.
  if (configPath) {
    // If the file does not exist.
    if (!pathExistsSync(configPath)) {
      GulpWinstonError({
        pluginName: PLUGIN_NAME,
        message: `Failed to find by this path ${configPath} file.`,
      });

      return null;
    }

    // If the file exists.
    return configPath;
  }

  // Looking for the nearest package.json file if the path is not specified or the file is not found along the path.
  const foundPath = await findUp(SEARCH_FILE, {
    cwd,
    type: "file",
  });

  if (!foundPath) {
    GulpWinstonError({
      pluginName: PLUGIN_NAME,
      message: `Failed to find ${SEARCH_FILE} file.`,
    });

    return null;
  }

  return foundPath;
};

export default findPackageJson;
