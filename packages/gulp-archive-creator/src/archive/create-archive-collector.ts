import type { Vinyl } from '@zilero/gulp-plugin-factory';
import type { Archiver } from 'archiver';

import { toPosixPath } from '@zilero/gulp-plugin-factory';
import { TarArchive, ZipArchive } from 'archiver';
import { Readable } from 'node:stream';
import { match } from 'ts-pattern';

import type { ArchiveCollector, CreateArchiveCollectorInput } from './archive.types';

const createArchive = ({ format, options = {} }: CreateArchiveCollectorInput): Archiver =>
  match(format)
    .with('zip', () => new ZipArchive(options))
    .with('tar', () => new TarArchive(options))
    .with('tgz', () => new TarArchive({ ...options, gzip: true }))
    .exhaustive();

/**
 * Collects files into one archive. Reading starts with the first entry, so archiver never waits on a full
 * buffer; entries keep the modification time and mode of files that came from disk.
 */
export const createArchiveCollector = (input: CreateArchiveCollectorInput): ArchiveCollector => {
  const archive = createArchive(input);
  const chunks = archive.toArray();
  let first: Vinyl | undefined;
  let failure: unknown;

  // An entry whose stream fails, or a warning, fails the archive: kept here and thrown from add or finish,
  // instead of an unhandled error event that would crash gulp. archiver never finishes after a failed entry,
  // so finish races it against this promise.
  const failed = Promise.withResolvers<never>();
  failed.promise.catch(() => {});

  const fail = (error: unknown): void => {
    if (failure) {
      return;
    }

    failure = error;
    failed.reject(error);
    // Stops archiver's queue and the remaining entry streams.
    archive.abort();
  };

  archive.on('error', fail);
  archive.on('warning', fail);
  chunks.catch(fail);

  const throwIfFailed = (): void => {
    if (failure) {
      throw failure;
    }
  };

  return {
    get first() {
      return first;
    },
    add: (file) => {
      throwIfFailed();

      first ??= file;

      const entry = { name: toPosixPath(file.relative), date: file.stat?.mtime, mode: file.stat?.mode };

      if (file.isDirectory()) {
        // The base folder itself (`src('dist')`) has no path inside the archive.
        if (entry.name) {
          archive.append(Buffer.alloc(0), { ...entry, type: 'directory' });
        }
      } else if (file.isBuffer()) {
        archive.append(file.contents, entry);
      } else if (file.isStream()) {
        const source = file.contents instanceof Readable ? file.contents : Readable.from(file.contents);

        source.on('error', fail);
        archive.append(source, entry);
      }
    },
    finish: async () => {
      throwIfFailed();

      const [, data] = await Promise.race([Promise.all([archive.finalize(), chunks]), failed.promise]);

      return Buffer.concat(data);
    }
  };
};
