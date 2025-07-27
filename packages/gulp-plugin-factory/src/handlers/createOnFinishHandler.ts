import type { PluginFactoryOptions } from '../schema';
import type { Flusher } from '../types';

// Creates a finish handler function for a gulp plugin.
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
