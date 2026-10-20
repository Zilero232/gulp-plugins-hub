import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTargetsResolver } from '../..';

let base: string;

beforeAll(async () => {
  base = await realpath(await mkdtemp(path.join(tmpdir(), 'css-targets-')));
  await writeFile(path.join(base, '.browserslistrc'), 'safari 10\n');
});

afterAll(() => rm(base, { recursive: true, force: true }));

describe('createTargetsResolver', () => {
  it('resolves a query once, for every file', () => {
    const resolve = createTargetsResolver('safari 10');

    expect(resolve('/a/main.css')).toBe(resolve('/b/other.css'));
    expect(resolve('/a/main.css')).toHaveProperty('safari');
  });

  it('throws for an invalid query right away', () => {
    expect(() => createTargetsResolver('no such browser 99')).toThrow(/Unknown browser query/);
  });

  it('reads the config nearest to each file without a query', () => {
    const resolve = createTargetsResolver(undefined);

    expect(Object.keys(resolve(path.join(base, 'main.css')))).toEqual(['safari']);
  });
});
