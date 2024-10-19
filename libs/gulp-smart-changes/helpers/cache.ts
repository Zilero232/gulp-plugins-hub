import path from "node:path";
import fs from "node:fs/promises";

import { handleUnknownError, InvalidFormatError } from "@shared/utils";
import { isObject, isString } from "@shared/helpers/typeHelpers";

import { PLUGIN_NAME } from "../constants";

interface baseCacheOptions {
  cacheFilePath: string;
}

/**
 * Loads the cache from a file.
 *
 * @param {{ cacheFilePath: string }} options The options for loading the cache.
 * @returns {Promise<Map<string, string>>} A promise that resolves with the loaded cache or a new Map if the file is not found.
 *
 * @throws {InvalidFormatError} If the cacheFilePath is not a string.
 * @throws {Error} If there is an error reading the file.
 */
export const loadCache = async ({ cacheFilePath }: baseCacheOptions): Promise<Map<string, string>> => {
  if (!cacheFilePath && !isString(cacheFilePath)) {
    throw new InvalidFormatError({
      fieldName: "loadCache: cacheFilePath",
      receivedValue: cacheFilePath,
      expectedType: "string",
    });
  }

  try {
    const data = await fs.readFile(cacheFilePath, "utf-8");

    return new Map(Object.entries(JSON.parse(data)));
  } catch (error: unknown) {
    handleUnknownError({
      pluginName: PLUGIN_NAME,
      message: "Failed to load cache.",
      error,
      onError: (typedError) => {
        // If the file is not found, we return a new Map.
        if (typedError.code === "ENOENT") {
          return new Map();
        }
      },
    });
  }
};

interface SaveCacheProps extends baseCacheOptions {
  cache: Map<string, string>;
}

/**
 * Saves the cache to a file.
 *
 * @param {{ cache: Map<string, string>, cacheFilePath: string }} options The options for saving the cache.
 * @returns {Promise<void>} A promise that resolves when the cache is saved.
 *
 * @throws {InvalidFormatError} If the cache is not an object or the cacheFilePath is not a string.
 * @throws {Error} If there is an error writing the file.
 */
export const saveCache = async ({ cache, cacheFilePath }: SaveCacheProps): Promise<void> => {
  if (!cache && !isObject(cache)) {
    throw new InvalidFormatError({
      fieldName: "loadCache: cache",
      receivedValue: cache,
      expectedType: "object",
    });
  }

  if (!cacheFilePath && !isString(cacheFilePath)) {
    throw new InvalidFormatError({
      fieldName: "loadCache: cacheFilePath",
      receivedValue: cacheFilePath,
      expectedType: "string",
    });
  }

  const data = JSON.stringify(Object.fromEntries(cache));
  const pathWriteFile = path.resolve(process.cwd(), cacheFilePath);

  await fs.writeFile(pathWriteFile, data, "utf-8");
};
