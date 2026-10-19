import { describe, expect, it } from 'vitest';

import type { Workspace } from '../publish.types';

import { sortByDependencies } from '../sort-by-dependencies';

const workspace = (name: string, dependencies: string[] = []): Workspace => ({
  directory: `packages/${name}`,
  manifest: {
    name,
    version: '1.0.0',
    dependencies: Object.fromEntries(dependencies.map((dependency) => [dependency, '^1.0.0']))
  }
});

const names = (workspaces: Workspace[]): string[] => workspaces.map(({ manifest }) => manifest.name);

describe('sortByDependencies', () => {
  it('puts every package after the workspace packages it depends on', () => {
    const sorted = sortByDependencies([
      workspace('plugin-a', ['factory', 'zod']),
      workspace('preset', ['plugin-a', 'factory']),
      workspace('factory'),
      workspace('plugin-b', ['factory'])
    ]);

    expect(names(sorted)).toEqual(['factory', 'plugin-a', 'plugin-b', 'preset']);
  });

  it('orders peer and optional workspace dependencies first too', () => {
    const plugin: Workspace = {
      directory: 'packages/plugin',
      manifest: { name: 'plugin', version: '1.0.0', peerDependencies: { factory: '^1.0.0' } }
    };

    expect(names(sortByDependencies([plugin, workspace('factory')]))).toEqual(['factory', 'plugin']);
  });

  it('throws on a dependency cycle', () => {
    expect(() => sortByDependencies([workspace('a', ['b']), workspace('b', ['a'])])).toThrow(
      'Workspace dependency cycle'
    );
  });

  it('keeps the order of independent packages', () => {
    expect(names(sortByDependencies([workspace('b'), workspace('a')]))).toEqual(['b', 'a']);
  });
});
