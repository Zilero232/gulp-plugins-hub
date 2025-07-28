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

	// File Counter.
	let fileCount = 0;

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				if (file.isBuffer()) {
					// Adding the file to the archive.
					archive.append(file.contents, { name: file.relative });

					// Increasing the file counter.
					fileCount += 1;

					// Log progress if enabled.
					if (pluginOptions?.logProgress) {
						console.log(`Added ${file.relative} to the archive.`);
					}
				}

				return; // Skip the file.
			} catch (error: unknown) {
				console.error(`An error occurred while adding file to the archive.`, error);
			}
		},
		onFinish: async (stream: TransformStream) => {
			try {
				const isArchive = fileCount > 0;

				if (!isArchive && !pluginOptions?.createEmptyArchive) {
					return console.warn('No files were added to the archive. The archive was not created.');
				}

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

				// Log the result.
				if (pluginOptions?.logFinal) {
					console.log(`Successfully processed ${fileCount} files into ${pluginOptions?.archiveName}`);
				}
			} catch (error: unknown) {
        throw new Error(`An error occurred while finalizing the archive.`, { cause: error });
			}
		},
	});
};

export default GulpArchiveCreator;
