import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { syncSourceMapFile } from '../..';
import { createFile } from '../../../testing';

describe('syncSourceMapFile', () => {
  it("points the map at the file's new name and leaves files without a map alone", () => {
    const file = createFile({ path: 'a.js', contents: 'x', sourceMap: true });

    file.path = path.join(file.base, 'js', 'b.min.js');

    syncSourceMapFile(file);

    expect(file.sourceMap.file).toBe('js/b.min.js');

    const plain = createFile({ path: 'a.js' });

    syncSourceMapFile(plain);

    expect(plain.sourceMap).toBeUndefined();
  });
});
