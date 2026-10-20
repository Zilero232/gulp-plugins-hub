import { describe, expect, it } from 'vitest';

import { createFile, getContents } from '../..';

describe('getContents', () => {
  it('returns the Buffer contents and throws for anything else', () => {
    expect(getContents(createFile({ contents: 'a' })).toString()).toBe('a');
    expect(() => getContents(createFile({ contents: null }))).toThrow('got another file');
    expect(() => getContents(undefined)).toThrow('got nothing');
  });
});
