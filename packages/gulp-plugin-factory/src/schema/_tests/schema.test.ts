import { describe, expect, it } from 'vitest';

import { isFunction, isObject } from '..';

describe('isFunction', () => {
  it('tells functions from everything else', () => {
    expect(isFunction(() => 1)).toBe(true);
    expect(isFunction(async () => 1)).toBe(true);
    expect(isFunction({})).toBe(false);
  });
});

describe('isObject', () => {
  it('accepts plain objects only', () => {
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject('x')).toBe(false);
  });
});
