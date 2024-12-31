import { checkIsFile, handleUnknownError } from '../utils';

import type { PluginFactoryOptions, Transformer, TransformStream } from '../types';

/**
 * Creates a file transform handler for a gulp plugin.
 *
 * @remarks
 * The transformer function will check if the plugin supports any type of file and if the file is a directory.
 * If the plugin does not support any type of file and the file is a directory, it will return the original file.
 * Otherwise, it will call the onFile function with the file, encoding, and stream as arguments.
 * If the onFile function returns a File, it will be returned by the transformer function.
 * If the onFile function throws an error, it will be caught and handled by the handleUnknownError function.
 *
 * @returns {Transformer} A transformer function that takes a file, encoding, and stream as arguments and returns a File or void.
 */
export function createFileTransformHandler({
	pluginName,
	supportsDirectories = false,
	supportsAnyType = false,
	onFile,
}: PluginFactoryOptions): Transformer {
	return async (file: FileVinyl, encoding: BufferEncoding, stream: TransformStream): Promise<FileVinyl | void> => {
		// If the plugin does not support any type of file and the file is a directory, return the original file.
		if (!supportsAnyType && !supportsDirectories && file.isDirectory()) {
			return file;
		}

		try {
			// Call the onFile function with the file, encoding, and stream as arguments.
			const result = await onFile(file, encoding, stream);

			// Check if the result is a File or not;
			if (checkIsFile(result)) {
				// Return the result if it's a File
				return result; // Return the result if it's a File
			}

			// If the result is not a File, return the original file.
			return file;
		} catch (error: unknown) {
			// Catch any errors thrown by the onFile function and handle them with the handleUnknownError function.
			handleUnknownError({
				pluginName,
				error,
			});
		}
	};
}
