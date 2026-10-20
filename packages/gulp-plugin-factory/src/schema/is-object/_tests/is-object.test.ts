import { describe, expect, it } from 'vitest';

import { isObject } from '../..';

describe('isObject', () => {
  it('accepts plain objects only', () => {
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject('x')).toBe(false);
  });
});
