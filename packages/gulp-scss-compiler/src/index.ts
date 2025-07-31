import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import * as sass from 'sass-embedded';

import type { GulpScssSqueezerOptions } from './schema';
import { gulpScssSqueezerSchema } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpScssSqueezerSchema,
  defaults: defaultOptions,
});

const GulpScssSqueezer = (options: GulpScssSqueezerOptions = {}) => {
  const { scssOptions = {}, pluginOptions = {} } = validateOptions(options);

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file: FileVinyl) => {
      try {
        if (!file.isBuffer()) {
          return file;
        }

        // Get the content of the file.
        let content = file.contents.toString();

        if (pluginOptions.onBeforeCompile) {
          // onBeforeCompile call (if passed).
          content = await pluginOptions.onBeforeCompile(content);
        }

        // Compile the SCSS content.
        const result = sass.compile(file.path, {
          ...scssOptions,
          sourceMap: true,
          loadPaths: [file.base],
        });

        // Update the content of the file.
        content = result.css;

        if (pluginOptions.onAfterCompile) {
          // onAfterCompile call (if passed).
          content = await pluginOptions.onAfterCompile(content);
        }

        // Convert the content to a buffer.
        file.contents = Buffer.from(content);

        // Update the extension of the file on .css.
        file.extname = '.css';

        return file;
      } catch (error: unknown) {
        throw new Error(`${PLUGIN_NAME}: Error processing ${file.relative}: ${error}`);
      }
    }
  });
};

export default GulpScssSqueezer;
