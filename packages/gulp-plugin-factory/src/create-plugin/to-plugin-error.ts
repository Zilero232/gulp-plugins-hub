import PluginError from 'plugin-error';

import type { ToPluginErrorInput } from './create-plugin.types';

/** Wraps anything thrown in a PluginError prefixed with the plugin name; a PluginError is returned as it is. */
export const toPluginError = ({ name, error, file }: ToPluginErrorInput): PluginError => {
  if (error instanceof PluginError) {
    return error;
  }

  const cause = error instanceof Error ? error : new Error(String(error));

  return new PluginError(name, cause, { fileName: file?.path, showStack: false });
};
