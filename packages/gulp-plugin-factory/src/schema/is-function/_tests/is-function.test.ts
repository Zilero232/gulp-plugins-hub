import { describe, expect, it } from 'vitest';

import { isFunction } from '../..';

describe('isFunction', () => {
  it('tells functions from everything else', () => {
    expect(isFunction(() => 1)).toBe(true);
    expect(isFunction(async () => 1)).toBe(true);
    expect(isFunction({})).toBe(false);
  });
});
