import type { PluginFactoryOptions, Transformer } from '../types';

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
export function createFileTransformHandler(options: PluginFactoryOptions): Transformer {
  const { pluginName, onFile } = options;

  const fileTransformHandler: Transformer = async function(file, encoding, stream) {
    // If the file is a directory, return.
    if (file.isDirectory()) {
      return;
    }

    if (file.isNull()) {
      // If the file is null, call the callback with the file.
      return new Error('File is null.');
    }

    if (file.isStream()) {
      // If the file is not a stream, throw an error.
      return new Error('Streaming not supported.');
    }

		try {
			// Call the onFile function with the file, encoding, and stream as arguments.
			const result = await onFile(file, encoding, stream);

      return result;
		} catch (error: unknown) {
			// Catch any errors thrown by the onFile function and handle them with the handleUnknownError function.
			throw new Error(`${pluginName}: ${error}`);
		}
  }

	return fileTransformHandler;
}
