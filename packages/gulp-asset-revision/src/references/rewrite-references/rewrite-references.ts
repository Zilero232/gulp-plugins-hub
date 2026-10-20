import path from 'node:path';

import type { RewriteReferencesInput } from './rewrite-references.types';

import { findReferences } from '../find-references';

/**
 * The text with every reference to a revised asset pointing at its new name, written the same way: relative to
 * the file when it was, relative to the base otherwise. References to assets without a revision yet stay.
 */
export const rewriteReferences = ({ content, fromDir, assets, files, revisions }: RewriteReferencesInput): string => {
  let result = '';
  let position = 0;

  for (const { start, end, target, fileRelative } of findReferences({ content, fromDir, assets, files })) {
    const revised = revisions[target];

    if (revised === undefined) {
      continue;
    }

    result += content.slice(position, start) + (fileRelative ? path.posix.relative(fromDir, revised) : revised);
    position = end;
  }

  return result + content.slice(position);
};
