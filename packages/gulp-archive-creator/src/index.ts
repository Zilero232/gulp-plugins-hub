import type { Transform as TransformStream } from 'node:stream';
import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from "@zilero/gulp-plugin-factory";

import archiver from 'archiver';
import concat from 'concat-stream';
import Vinyl from 'vinyl';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { gulpArchiveCreatorSchema, type GulpArchiveCreatorOptions } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpArchiveCreatorSchema,
  defaults: defaultOptions,
});

// Creates a Gulp plugin that can be used to create archives of files in a stream.
const GulpArchiveCreator = (options: GulpArchiveCreatorOptions) => {
  const { format, archiveOptions, pluginOptions } = validateOptions(options);

	// Create an archive stream using the chosen format.
	const archive = archiver(format, archiveOptions);

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				if (file.isBuffer()) {
					// Adding the file to the archive.
					archive.append(file.contents, { name: file.relative });
				}

				return; // Skip the file.
			} catch (error: unknown) {
				throw new Error(`An error occurred while adding file to the archive.`, { cause: error });
			}
		},
		onFinish: async (stream: TransformStream) => {
			try {
        const archiveBuffer = await new Promise<Buffer>((resolve, reject) => {
          const concatStream = concat((buffer) => {
            resolve(buffer);
          });

          archive.pipe(concatStream);
          archive.on('error', reject);

          archive.finalize();
        });

        const outputFile = new Vinyl({
          contents: archiveBuffer,
          path: pluginOptions?.archiveName,
          extname: `.${format}`,
        });

        // Push the created archive file to the stream.
        stream.push(outputFile);
			} catch (error: unknown) {
        throw new Error(`An error occurred while finalizing the archive.`, { cause: error });
			}
		},
	});
};

export default GulpArchiveCreator;
