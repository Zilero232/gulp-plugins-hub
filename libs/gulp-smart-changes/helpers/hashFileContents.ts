import { createHash } from "crypto";

import { InvalidFormatError } from "@shared/utils";
import { isString } from "@shared/helpers/typeHelpers";

interface HashFileContentsProps {
  content: string;
}

/**
 * Generates a hash of the given content using the blake2b256 algorithm.
 *
 * @param {{ content: string }} props
 *
 * @returns {Promise<string>} A promise that resolves to the hash of the content as a hexadecimal string.
 *
 * @throws {InvalidFormatError} - If the content is not a string.
 */
const hashFileContents = async ({ content }: HashFileContentsProps): Promise<string> => {
  if (!content || !isString(content)) {
    throw new InvalidFormatError({
      fieldName: "hashFileContents",
      receivedValue: content,
      expectedType: "string",
    });
  }

  const hash = createHash("blake2b256");

  hash.update(content);

  return hash.digest("hex");
};

export default hashFileContents;
