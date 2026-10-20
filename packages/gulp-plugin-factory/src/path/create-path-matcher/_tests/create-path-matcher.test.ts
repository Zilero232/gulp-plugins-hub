import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { createPathMatcher } from '../..';

describe('createPathMatcher', () => {
  it('matches name globs anywhere, path globs from the base and regular expressions', () => {
    const matches = createPathMatcher({ patterns: ['*.map', 'drafts/**', /\.tmp$/] });

    expect(['a/b.js.map', 'drafts/x/y.md', 'c.tmp', 'src/drafts/z.md', 'keep.js'].map(matches)).toEqual([
      true,
      true,
      true,
      false,
      false
    ]);
  });

  it('matches paths with the separators of the OS', () => {
    expect(createPathMatcher({ patterns: ['drafts/**'] })(path.join('drafts', 'a.md'))).toBe(true);
  });

  it('restarts global regular expressions on every path', () => {
    const matches = createPathMatcher({ patterns: [/\.md$/g] });

    expect([matches('a.md'), matches('b.md')]).toEqual([true, true]);
  });

  it('ignores the case of globs when asked', () => {
    expect(createPathMatcher({ patterns: ['*.png'] })('A.PNG')).toBe(false);
    expect(createPathMatcher({ patterns: ['*.png', 'img/**'], ignoreCase: true })('IMG/A.PNG')).toBe(true);
  });
});
