import type { Flusher, PluginFactoryOptions } from '../types';

/**
 * Creates a finish handler function for a gulp plugin. If onFinish is not provided, returns a no-op function.
 * Otherwise, it wraps the onFinish function with error handling via handleUnknownError.

 * @returns {Flusher} - The wrapped finish handler function.
 */
export function createOnFinishHandler({ pluginName, onFinish }: PluginFactoryOptions): Flusher {
  const onFinishHandler: Flusher = async function(stream) {
		try {
			if (onFinish) {
				await onFinish(stream);
			}
		} catch (error: unknown) {
			throw new Error(`${pluginName}: ${error}`);
		}
	};

  return onFinishHandler;
}
