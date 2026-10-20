import { describe, expect, it } from 'vitest';

import { getInputSourceMap } from '../..';
import { createFile } from '../../../testing';

const map = (sources: string[]) => ({ version: 3, names: [], mappings: 'AAAA', sources });

describe('getInputSourceMap', () => {
  it('returns the map as JSON when it has mappings', () => {
    const file = createFile({ path: 'app.js' });

    file.sourceMap = map(['src/app.ts']);

    expect(getInputSourceMap(file)).toBe(JSON.stringify(map(['src/app.ts'])));
  });

  it('returns undefined without a map or with empty mappings', () => {
    expect(getInputSourceMap(createFile())).toBeUndefined();
    expect(getInputSourceMap(createFile({ contents: 'x', sourceMap: true }))).toBeUndefined();
  });
});
