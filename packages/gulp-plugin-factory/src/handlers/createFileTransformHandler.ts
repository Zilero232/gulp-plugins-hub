import type { PluginFactoryOptions } from '../schema';
import type { Transformer } from '../types';

// Creates a file transform handler for a gulp plugin.
export function createFileTransformHandler(options: PluginFactoryOptions): Transformer {
  const { pluginName, onFile } = options;

  const fileTransformHandler: Transformer = async function(file, encoding, stream) {
    // If the file is a directory, return.
    if (file.isDirectory()) {
      return;
    }

    if (file.isNull()) {
      // If the file is null, call the callback with the file.
      throw new Error('File is null.');
    }

    if (file.isStream()) {
      // If the file is not a stream, throw an error.
      throw new Error('Streaming not supported.');
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
