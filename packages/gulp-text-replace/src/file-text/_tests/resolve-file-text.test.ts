import { createFile } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import { resolveFileText } from '..';

const file = createFile({ path: 'a.js' });

describe('resolveFileText', () => {
  it('returns the text, what the function returns, or nothing', async () => {
    expect(await resolveFileText({ name: 'header', text: 'x', file })).toBe('x');
    expect(await resolveFileText({ name: 'header', text: async ({ file: { stem } }) => stem, file })).toBe('a');
    expect(await resolveFileText({ name: 'header', text: undefined, file })).toBe('');
  });

  it('names the option when the function returns something other than a string', async () => {
    // @ts-expect-error: a JavaScript footer that returns null
    await expect(resolveFileText({ name: 'footer', text: () => null, file })).rejects.toThrow(
      'footer must return the text as a string, got null'
    );
  });
});
