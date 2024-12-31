import { join } from "node:path";

import { type Tree, joinPathFragments, generateFiles, formatFiles, names } from "@nx/devkit";

import GulpWinstonLogger from "@zilero/gulp-winston-logger";

import type { PluginSchema } from "./schema";

import { PLUGIN_NAME } from "./constants";

/**
 * This generator creates a new folder for a gulp plugin.
 *
 * @param tree The Nx file tree.
 * @param schema The options for the generator.
 *
 * @returns A promise that resolves when the generator is finished.
 */
export async function CreateFolderPluginGenerator(tree: Tree, schema: PluginSchema) {
  if (!schema.name) {
    return GulpWinstonLogger({
      pluginName: PLUGIN_NAME,
      message: `You must specify the name of the plugin.`,
    });
  }

  const pluginPath = joinPathFragments("libs", schema.name);

  if (tree.exists(pluginPath)) {
    return GulpWinstonLogger({
      pluginName: PLUGIN_NAME,
      message: `The folder with the plugin "${pluginPath}" it already exists.`,
    });
  }

  const templateOptions = {
    ...schema,
    name: names(schema.name).fileName, // This value will be replaced in the templates.
    PluginName: names(schema.name).className,
  };

  // File Generation.
  generateFiles(tree, join(__dirname, "files"), pluginPath, templateOptions);

  // Format the files.
  await formatFiles(tree);
}

export default CreateFolderPluginGenerator;
