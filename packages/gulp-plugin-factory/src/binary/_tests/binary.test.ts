import { describe, expect, it } from 'vitest';

import { assertBinaryContents } from '..';

const PNG_HEADER = Buffer.from('\x89PNG\r\n\x1A\n', 'latin1');

describe('assertBinaryContents', () => {
  it('accepts binary contents', () => {
    expect(() => assertBinaryContents({ relative: 'a.png', contents: PNG_HEADER })).not.toThrow();
  });

  it('throws with the fix for contents that went through UTF-8', () => {
    const corrupted = Buffer.from(PNG_HEADER.toString('utf8'));

    expect(() => assertBinaryContents({ relative: 'img/a.png', contents: corrupted })).toThrow(
      'img/a.png was read as UTF-8 text and is corrupted. Read binary files with `src(globs, { encoding: false })`'
    );
  });
});
