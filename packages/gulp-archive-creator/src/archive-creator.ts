import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions, Vinyl } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { ArchiveCollector } from './archive';
import type { ArchiveCreatorOptions } from './archive-creator.schema';

import { createArchiveCollector, resolveArchive } from './archive';
import { PLUGIN_NAME } from './archive-creator.constants';
import { archiveCreatorOptionsSchema } from './archive-creator.schema';

/**
 * Packs every file of the stream into one zip, tar or tar.gz archive and emits only the archive, named
 * relative to the base of the first file. Entries keep their paths relative to `file.base`. The archive is built
 * in memory, so it should fit in it.
 *
 * Read binary files with `encoding: false` (gulp 5 reads files as UTF-8 by default).
 *
 * @example
 * src('dist/**', { encoding: false }).pipe(archiveCreator({ name: 'site.zip' })).pipe(dest('releases'));
 */
export const archiveCreator = (options: ArchiveCreatorOptions = {}): PluginStream => {
  const { name, format, archiverOptions, emptyArchive, directories, modifiedTime } = parseOptions({
    name: PLUGIN_NAME,
    schema: archiveCreatorOptionsSchema,
    options
  });

  const target = resolveArchive({ name, format });

  // Created with the first entry: an empty stream makes no archive unless `emptyArchive` asks for one.
  let collector: ArchiveCollector | undefined;

  const getCollector = (): ArchiveCollector => {
    collector ??= createArchiveCollector({ format: target.format, options: archiverOptions, modifiedTime });

    return collector;
  };

  return createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    transform: (file) => {
      if (!file.isNull() || (directories && file.isDirectory())) {
        getCollector().add(file);
      }

      return null;
    },
    flush: async ({ push }) => {
      if (!collector && !emptyArchive) {
        return;
      }

      const archive = getCollector();
      const contents = await archive.finish();
      const cwd = archive.first?.cwd ?? process.cwd();
      const base = archive.first?.base ?? cwd;

      push(new Vinyl({ cwd, base, path: path.join(base, target.fileName), contents }));
    }
  });
};
