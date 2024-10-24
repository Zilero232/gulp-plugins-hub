import GulpWinstonError from "@zilero/gulp-winston-error";

import { InvalidFormatError } from "@shared/utils";
import { isString } from "@shared/helpers/typeHelpers";

import { PLUGIN_NAME } from "../constants";

import { GulpPluginManagerOptions } from "../types";

interface CheckPluginVersionProps {
  pluginName: string;
  pluginVersion: string;
  minVersions: GulpPluginManagerOptions["minVersions"];
}

/**
 * Checks if the plugin version is greater than the minimum version.
 * If the plugin version is outdated, it will log a message with the minimum version required.
 * If the plugin is not supported, it will log a message indicating that it is not supported.
 *
 * @param {CheckPluginVersionProps} props
 * @param {string} props.pluginName - The name of the plugin.
 * @param {string} props.pluginVersion - The version of the plugin.
 * @param {GulpPluginManagerOptions["minVersions"]} props.minVersions - The minimum versions of the plugins.
 */
const checkPluginVersion = ({ pluginName, pluginVersion, minVersions }: CheckPluginVersionProps) => {
  if (!minVersions) {
    return;
  }

  if (!pluginName || !isString(pluginName)) {
    throw new InvalidFormatError({
      fieldName: "CheckPluginVersion: pluginName",
      receivedValue: minVersions,
      expectedType: "string",
    });
  }

  if (!pluginVersion || !isString(pluginVersion)) {
    throw new InvalidFormatError({
      fieldName: "CheckPluginVersion: pluginVersion",
      receivedValue: pluginVersion,
      expectedType: "string",
    });
  }

  // Take the minimum version of the plugin depending on the plugin name.
  const minVersion = minVersions[pluginName];

  // Check if the plugin version is greater than the minimum version.
  const message =
    minVersion && pluginVersion < minVersion
      ? `Plugin ${pluginName} is outdated. Min version required: ${minVersion}`
      : `Plugin ${pluginName} is not supported.`;

  // Log the message.
  GulpWinstonError({
    pluginName: PLUGIN_NAME,
    message: message,
    options: {
      level: "info",
    },
  });
};

export default checkPluginVersion;
