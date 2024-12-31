import type { Transform as TransformStream } from 'node:stream';

import { handleUnknownError } from '../../../shared/utils/handleUnknownError/handleUnknownError';

import type { Flusher, PluginFactoryOptions } from '../types';

/**
 * Creates a finish handler function for a gulp plugin. If onFinish is not provided, returns a no-op function.
 * Otherwise, it wraps the onFinish function with error handling via handleUnknownError.
 
 * @returns {Flusher} - The wrapped finish handler function.
 */
export function createOnFinishHandler({ pluginName, onFinish }: PluginFactoryOptions): Flusher {
	// If onFinish is not provided, return a no-op function.
	if (!onFinish) {
		return async () => {}; // No-op function
	}

	return async (stream: TransformStream) => {
		try {
			await onFinish(stream);
		} catch (error: unknown) {
			handleUnknownError({
				pluginName,
				error,
			});
		}
	};
}
