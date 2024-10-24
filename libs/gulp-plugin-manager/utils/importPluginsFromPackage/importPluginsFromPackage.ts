import GulpWinstonError from "@zilero/gulp-winston-error";

import { handleUnknownError } from "@shared/utils";

import processPluginName from "../../helpers/processPluginName";

import { GulpPluginObject, NameFormatsValues } from "../../types";

import { PLUGIN_NAME } from "../../constants";

interface ImportPluginsFromPackageProps {
  pluginDependencies: Record<string, string>;
  formatName?: NameFormatsValues;
}

export const importPluginsFromPackage = async ({ pluginDependencies, formatName }: ImportPluginsFromPackageProps) => {
  const plugins: GulpPluginObject = {};

  for (const [pluginName, version] of Object.entries(pluginDependencies)) {
    try {
      // Dynamic plugin import.
      const pluginModule = await import(pluginName);

      // Process plugin name.
      const processedPluginName = processPluginName({ pluginName, formatName });

      // Add plugin to the plugins object.
      plugins[processedPluginName] = pluginModule.default || pluginModule;

      GulpWinstonError({
        pluginName: PLUGIN_NAME,
        message: `Plugin loaded: ${processedPluginName} (version: ${version})`,
        options: {
          level: "info",
        },
      });
    } catch (error: unknown) {
      handleUnknownError({
        pluginName: PLUGIN_NAME,
        message: `Failed to load plugin: ${pluginName}.`,
        error,
      });
    }
  }

  return plugins;
};
