import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import Fontmin from 'fontmin';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import type { GulpFontSwitcherOptions } from './schema';
import { gulpFontSwitcherSchema } from './schema';

import { processFontWithFontmin } from './utils/processFontWithFontmin';
import { convertFont } from './utils/convertFont';

import { isInputFormatSupported } from './helpers/isInputFormatSupported';
import { getFormatFromPath } from './helpers/getFormatFromPath';

import { PLUGIN_NAME, SUPPORTED_INPUT_FORMATS } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpFontSwitcherSchema,
})

const GulpFontSwitcher = (options: GulpFontSwitcherOptions) => {
  const { pluginOptions, fontOptions = {} } = validateOptions(options);

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file) => {
      try {
        if (!file.isBuffer()) {
          return file;
        }

        // Get source format from file.
        const sourceFormat = getFormatFromPath(file.path);

        // Check if the input format is supported.
        if (!isInputFormatSupported(sourceFormat)) {
          throw new Error(`Unsupported input format: ${sourceFormat}. Only ${SUPPORTED_INPUT_FORMATS.join(', ')} are supported.`);
        }

        // If the format is the same - return without changes.
        if (sourceFormat === pluginOptions.format) {
          return file;
        }

        // Create Fontmin instance.
        let fontmin = new Fontmin().src(file.contents);

        // Apply optimizations if enabled.
        if (fontOptions.glyph) {
          fontmin.use(Fontmin.glyph(fontOptions.glyph));
        }

        // Convert font to the desired format.
        fontmin = await convertFont(fontmin, sourceFormat, pluginOptions.format);

        // Process the file and wait for the result.
        const outputFile = await processFontWithFontmin(file, fontmin);

        if (outputFile && outputFile._contents) {
          // Update the file.
          file.contents = outputFile._contents;
          file.extname = `.${pluginOptions.format}`;
        }

        return file;
      } catch (error: unknown) {
        throw new Error(`Error processing ${file.relative}: ${error instanceof Error ? error.message : String(error)}` );
      }
    }
  });
};

export default GulpFontSwitcher;
