import { describe, expect, it } from 'vitest';

import { isCff } from '../..';

describe('isCff', () => {
  it('tells CFF outlines from TrueType ones by the signature', () => {
    expect(isCff(Buffer.from('OTTO\0\0'))).toBe(true);
    expect(isCff(Buffer.from([0, 1, 0, 0]))).toBe(false);
  });
});
