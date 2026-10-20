import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { runContentHook } from '..';

describe('runContentHook', () => {
  const file = createFile({ path: 'a.css', contents: 'a{}' });

  it('returns the text without a hook, and what a sync or async hook returns', async () => {
    expect(await runContentHook({ name: 'onBefore', content: 'a', file })).toBe('a');

    expect(await runContentHook({ name: 'onBefore', content: 'a', file, hook: ({ content }) => `${content}b` })).toBe(
      'ab'
    );

    expect(await runContentHook({ name: 'onBefore', content: 'a', file, hook: async () => 'c' })).toBe('c');
  });

  it('names the hook when it returns something other than text', async () => {
    // @ts-expect-error: a JavaScript hook that forgets to return the text
    const hook: () => string = () => undefined;

    await expect(runContentHook({ name: 'onAfterMinify', content: 'a', file, hook })).rejects.toThrow(
      'onAfterMinify must return the text as a string, got undefined'
    );
  });
});
