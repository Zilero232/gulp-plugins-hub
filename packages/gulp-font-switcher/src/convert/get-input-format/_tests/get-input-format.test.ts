import { describe, expect, it } from 'vitest';

import { getInputFormat } from '../..';

describe('getInputFormat', () => {
  it('maps font extensions in any case', () => {
    expect(getInputFormat('.TTF')).toBe('ttf');
    expect(getInputFormat('.woff2')).toBe('woff2');
    expect(getInputFormat('.css')).toBeUndefined();
  });
});
