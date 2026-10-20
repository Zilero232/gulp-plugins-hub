import { describe, expect, it } from 'vitest';

import { BINARY_SNIFF_LENGTH } from '../../text-replace.constants';
import { isBinary } from '../is-binary';

const withNulAt = (index: number): Buffer => {
  const contents = Buffer.alloc(BINARY_SNIFF_LENGTH + 10, 'a');

  contents[index] = 0;

  return contents;
};

describe('isBinary', () => {
  it('finds a NUL byte within the first 8000 bytes', () => {
    expect(isBinary(withNulAt(0))).toBe(true);
    expect(isBinary(withNulAt(BINARY_SNIFF_LENGTH - 1))).toBe(true);
  });

  it('ignores a NUL byte past the first 8000 bytes, and text without one', () => {
    expect(isBinary(withNulAt(BINARY_SNIFF_LENGTH))).toBe(false);
    expect(isBinary(Buffer.from('plain text é'))).toBe(false);
    expect(isBinary(Buffer.alloc(0))).toBe(false);
  });
});
