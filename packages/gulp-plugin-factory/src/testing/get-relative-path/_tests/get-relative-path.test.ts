import { describe, expect, it } from 'vitest';

import { getRelativePath } from '../..';

describe('getRelativePath', () => {
  it('throws without a file', () => {
    expect(() => getRelativePath(undefined)).toThrow('Expected a file, got nothing');
  });
});
