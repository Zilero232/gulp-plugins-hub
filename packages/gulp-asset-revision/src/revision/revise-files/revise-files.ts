import { syncSourceMapFile, toPosixPath } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { RevisionManifest } from '../../asset-revision.types';
import type { RevisionEntry } from '../revision.types';
import type { RevisedFiles, ReviseFilesInput } from './revise-files.types';

import { orderByDependencies } from '../../graph';
import { findReferences, rewriteReferences } from '../../references';
import { assertUniqueKeys } from '../assert-unique-keys';
import { hashContents } from '../hash-contents';
import { revisePath } from '../revise-path';

/**
 * Renames every asset after a hash of its contents and rewrites the references between files. An asset is hashed
 * after every asset it references, so its hash covers its rewritten references. Files on a reference cycle (and
 * the ones depending on it) and files that reference themselves cannot get a hash that covers their own new name,
 * so they keep their names, which keeps every reference to them valid. Files that keep their names are rewritten
 * once every asset has its new name. Files without an extension (`CNAME`, `.htaccess`) are never renamed.
 */
export const reviseFiles = ({ files, hashLength, isExcluded, isRewritable }: ReviseFilesInput): RevisedFiles => {
  const entries = files.map((file): RevisionEntry => {
    const key = toPosixPath(file.relative);

    return { file, key, fromDir: path.posix.dirname(key) };
  });

  assertUniqueKeys(entries);

  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  const assetEntries = entries.filter(({ key }) => path.posix.extname(key) !== '' && !isExcluded(key));
  const assets = new Set(assetEntries.map(({ key }) => key));
  const allKeys = new Set(entries.map(({ key }) => key));
  const manifest: RevisionManifest = {};

  // Contents are replaced only when a reference changed, so text that is not UTF-8 is never re-encoded.
  const rewrite = ({ file, fromDir }: RevisionEntry): void => {
    if (!isRewritable(file)) {
      return;
    }

    const content = file.contents.toString();
    const rewritten = rewriteReferences({ content, fromDir, assets, files: allKeys, revisions: manifest });

    if (rewritten !== content) {
      file.contents = Buffer.from(rewritten);
    }
  };

  const dependencies = new Map(
    assetEntries
      .filter(({ file }) => isRewritable(file))
      .map(({ file, key, fromDir }) => [
        key,
        new Set(
          findReferences({ content: file.contents.toString(), fromDir, assets, files: allKeys }).map(
            ({ target }) => target
          )
        )
      ])
  );

  const { ordered, cyclic } = orderByDependencies({ nodes: assetEntries.map(({ key }) => key), dependencies });

  const kept = new Set([
    ...cyclic,
    ...[...dependencies].filter(([key, targets]) => targets.has(key)).map(([key]) => key)
  ]);

  for (const key of ordered) {
    const entry = byKey.get(key);

    if (!entry || kept.has(key)) {
      continue;
    }

    rewrite(entry);

    const hash = hashContents({ contents: entry.file.contents, length: hashLength });
    const revised = revisePath({ relative: key, hash });

    manifest[key] = revised;

    // The same metadata gulp-rev sets, for the tools that read it (gulp-rev-delete-original, …).
    entry.file.revOrigPath = entry.file.path;
    entry.file.revOrigBase = entry.file.base;
    entry.file.revHash = hash;
    entry.file.path = path.join(entry.file.base, revised);

    syncSourceMapFile(entry.file);
  }

  for (const entry of entries) {
    if (!assets.has(entry.key) || kept.has(entry.key)) {
      rewrite(entry);
    }
  }

  return { files, manifest };
};
