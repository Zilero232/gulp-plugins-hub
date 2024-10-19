import { InvalidFormatError } from "@shared/utils";
import { isBoolean } from "@shared/helpers/typeHelpers";

import compareByNameHelper from "../../helpers/compareByName";
import compareByExtensionHelper from "../../helpers/compareByExtension";
import compareLastModifiedTimeHelper from "../../helpers/compareLastModifiedTime";

interface CompareFileOptions {
  compareByName?: boolean;
  compareByExtension?: boolean;
  compareByMtime?: boolean;
}

interface CompareFileProps {
  filePath: string;
  destinationPath: string;
  fileStatMtimeMs: number;
  options?: CompareFileOptions;
}

/**
 * Compares source and target files using the provided options.
 *
 * @param {CompareFileProps} props - Comparison options.
 * @param {string} props.filePath - Path to the source file.
 * @param {string} props.destinationPath - Path to the target file.
 * @param {number} [props.fileStatMtimeMs] - Last modified time of the source file in milliseconds.
 * @param {CompareFileOptions} [props.options] - Comparison options.
 *
 * @returns {Promise<boolean>} - Resolves to true if the source and target files match, otherwise false.
 *
 * @throws {InvalidFormatError} - If the options are not of the correct format.
 */
export const compareFileAttributes = async ({ filePath, destinationPath, fileStatMtimeMs, options }: CompareFileProps): Promise<boolean> => {
  // If no options are provided, return true.
  if (!options) {
    return true;
  }

  const { compareByName = false, compareByExtension = false, compareByMtime = false } = options;

  // If user enabled compare by name, match the file name.
  if (compareByName) {
    if (!isBoolean(compareByName)) {
      throw new InvalidFormatError({
        fieldName: "CompareFile: compareByName",
        receivedValue: compareByName,
        expectedType: "boolean",
      });
    }

    return compareByNameHelper({ sourcePath: filePath, targetPath: destinationPath });
  }

  // If user enabled compare by extension, match the file extension.
  if (compareByExtension) {
    if (!isBoolean(compareByExtension)) {
      throw new InvalidFormatError({
        fieldName: "CompareFile: compareByExtension",
        receivedValue: compareByExtension,
        expectedType: "boolean",
      });
    }

    return compareByExtensionHelper({ sourcePath: filePath, targetPath: destinationPath });
  }

  // If user enabled compare by mtime, match the last modified time.
  if (compareByMtime) {
    if (!isBoolean(compareByMtime)) {
      throw new InvalidFormatError({
        fieldName: "CompareFile: compareByMtime",
        receivedValue: compareByMtime,
        expectedType: "boolean",
      });
    }

    return await compareLastModifiedTimeHelper({ sourceMtimeMs: fileStatMtimeMs, targetPath: destinationPath });
  }

  return true;
};
