import { InvalidFormatError } from "@shared/utils";
import { isObject } from "@shared/helpers/typeHelpers";

import checkPluginVersion from "../../helpers/checkPluginVersion";

import { GulpPluginManagerOptions } from "../../types";

interface PluginVersionCheckerProps {
  packagePlugins: Record<string, string>;
  minVersions: GulpPluginManagerOptions["minVersions"];
}

/**
 * Checks plugin versions and logs messages if a plugin version is outdated.
 *
 * @param {PluginVersionCheckerProps} props
 * @param {Record<string, string>} props.packagePlugins - The plugins object from package.json with the plugin name as the key and the plugin version as the value.
 * @param {GulpPluginManagerOptions["minVersions"]} props.minVersions - The minimum versions of the plugins.
 */
export const pluginVersionChecker = ({ packagePlugins, minVersions }: PluginVersionCheckerProps) => {
  if (!minVersions) {
    return;
  }

  if (!isObject(minVersions)) {
    throw new InvalidFormatError({
      fieldName: "PluginVersionChecker: minVersions",
      receivedValue: minVersions,
      expectedType: "object",
    });
  }

  for (const [pluginName, pluginVersion] of Object.entries(packagePlugins)) {
    checkPluginVersion({
      pluginName,
      pluginVersion,
      minVersions,
    });
  }
};
