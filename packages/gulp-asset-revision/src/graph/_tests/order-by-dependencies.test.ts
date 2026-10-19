import { describe, expect, it } from 'vitest';

import { orderByDependencies } from '..';

const graph = (entries: Record<string, string[]>) =>
  new Map(Object.entries(entries).map(([node, deps]) => [node, new Set(deps)]));

describe('orderByDependencies', () => {
  it('orders every node after its dependencies, keeping the input order otherwise', () => {
    const result = orderByDependencies({
      nodes: ['main.css', 'app.js', 'icon.svg', 'dot.png'],
      dependencies: graph({ 'main.css': ['icon.svg'], 'icon.svg': ['dot.png'], 'app.js': ['main.css'] })
    });

    expect(result).toEqual({ ordered: ['dot.png', 'icon.svg', 'main.css', 'app.js'], cyclic: [] });
  });

  it('leaves the nodes of a cycle and the ones waiting for it', () => {
    const result = orderByDependencies({
      nodes: ['a', 'b', 'c', 'd'],
      dependencies: graph({ a: ['b'], b: ['a'], c: ['a'], d: [] })
    });

    expect(result).toEqual({ ordered: ['d'], cyclic: ['a', 'b', 'c'] });
  });

  it('ignores self references and dependencies that are not nodes', () => {
    expect(orderByDependencies({ nodes: ['a'], dependencies: graph({ a: ['a', 'missing'] }) })).toEqual({
      ordered: ['a'],
      cyclic: []
    });
  });
});
