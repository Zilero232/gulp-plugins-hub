import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { toPosixPath } from '../..';

describe('toPosixPath', () => {
  it('joins the segments with /', () => {
    expect(toPosixPath(['css', 'main.css'].join(path.sep))).toBe('css/main.css');
  });
});
