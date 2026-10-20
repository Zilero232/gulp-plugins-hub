import escapeStringRegexp from 'escape-string-regexp';
import path from 'node:path';

import type { FindReferencesInput } from '../references.types';
import type { GetCandidatesInput, Reference } from './find-references.types';

// A reference starts after a quote, a bracket, `=`, `,`, whitespace or the start of the text, and may begin with
// `/` (root-relative) or `./`. It ends before a quote, a bracket, whitespace, `?`, `#`, `,`, `;`, `\`, the end of a
// tag (minified HTML drops the quotes: `href=/css/main.css>`) or the end of the text.
const BEFORE = String.raw`(?<=^|[\s"'\`(=,])`;
const AFTER = String.raw`(?=$|[\s"'\`),;?#\\<>}])`;

/**
 * The pattern of every reference from a folder, built once per set of assets and folder: a site has many files
 * per folder, and each is scanned twice (to order the hashing, then to rewrite).
 */
const patterns = new WeakMap<ReadonlySet<string>, Map<string, RegExp | undefined>>();

/** Every way an asset can be written from `fromDir`: relative to the base, and relative to the file. */
const getCandidates = ({ fromDir, assets }: GetCandidatesInput): string[] => {
  const candidates = new Set<string>();

  for (const asset of assets) {
    candidates.add(asset);
    candidates.add(path.posix.relative(fromDir, asset));
  }

  // The longest first, so `a/b.png` wins over `b.png`.
  return [...candidates].sort((a, b) => b.length - a.length);
};

/** The reference pattern for `fromDir`, from the cache; undefined when there is no asset to find. */
const getPattern = ({ fromDir, assets }: GetCandidatesInput): RegExp | undefined => {
  const byFolder = patterns.get(assets) ?? new Map<string, RegExp | undefined>();

  patterns.set(assets, byFolder);

  if (!byFolder.has(fromDir)) {
    const candidates = getCandidates({ fromDir, assets });

    byFolder.set(
      fromDir,
      candidates.length
        ? new RegExp(
            `${BEFORE}(\\/|\\.\\/)?(${candidates.map((candidate) => escapeStringRegexp(candidate)).join('|')})${AFTER}`,
            'g'
          )
        : undefined
    );
  }

  return byFolder.get(fromDir);
};

/**
 * The references to assets in a text file, resolved the way a browser does: `/img/a.png` from the base,
 * `../img/a.png` and `./img/a.png` from the file, and a bare `img/a.png` from the file when that asset exists,
 * else from the base (pages at the root, scripts that build URLs).
 */
export const findReferences = ({ content, fromDir, assets, files = assets }: FindReferencesInput): Reference[] => {
  const pattern = getPattern({ fromDir, assets });

  if (!pattern) {
    return [];
  }

  // matchAll works on a copy of the pattern, so the cached one keeps no position between files.
  const references: Reference[] = [];

  for (const match of content.matchAll(pattern)) {
    const [, prefix = '', text = ''] = match;
    const start = match.index + prefix.length;
    const fromFile = path.posix.normalize(path.posix.join(fromDir, text));

    if (prefix === '/') {
      if (assets.has(text)) {
        references.push({ start, end: start + text.length, target: text, fileRelative: false });
      }

      continue;
    }

    // The file next to the referencing one wins, even when it keeps its name: the browser loads that one.
    if (files.has(fromFile)) {
      if (assets.has(fromFile)) {
        references.push({ start, end: start + text.length, target: fromFile, fileRelative: true });
      }
    } else if (!prefix && assets.has(text)) {
      references.push({ start, end: start + text.length, target: text, fileRelative: false });
    }
  }

  return references;
};
