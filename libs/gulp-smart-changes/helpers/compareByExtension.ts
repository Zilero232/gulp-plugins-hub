import path from "path";

import { InvalidFormatError } from "@shared/utils";
import { isString } from "@shared/helpers/typeHelpers";

interface CompareByExtensionProps {
  sourcePath: string;
  targetPath: string;
}

/**
 * Compares the file extensions of the source and target paths.
 *
 * @param {CompareByExtensionProps} props - Comparison options.
 * @param {string} props.sourcePath - Source path to compare.
 * @param {string} props.targetPath - Target path to compare.
 *
 * @returns {boolean} - Whether the source and target paths have the same file extension.
 *
 * @throws {InvalidFormatError} - If the sourcePath or targetPath is not a string.
 */
const compareByExtension = ({ sourcePath, targetPath }: CompareByExtensionProps): boolean => {
  if (!sourcePath || !isString(targetPath)) {
    throw new InvalidFormatError({
      fieldName: "compareByExtension",
      receivedValue: sourcePath,
      expectedType: "string",
    });
  }

  if (!targetPath || !isString(targetPath)) {
    throw new InvalidFormatError({
      fieldName: "compareByExtension",
      receivedValue: targetPath,
      expectedType: "string",
    });
  }

  return path.extname(sourcePath) === path.extname(targetPath);
};

export default compareByExtension;
