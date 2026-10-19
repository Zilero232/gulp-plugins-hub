import type { DependencyOrder, OrderByDependenciesInput } from './graph.types';

/**
 * A topological order (Kahn's algorithm): each round takes every node whose dependencies are all ordered, in
 * the input order. What is left when no node can be taken is on a cycle, or waits for one.
 */
export const orderByDependencies = ({ nodes, dependencies }: OrderByDependenciesInput): DependencyOrder => {
  const known = new Set(nodes);
  const ordered: string[] = [];
  const done = new Set<string>();
  let remaining = nodes;

  while (remaining.length) {
    const ready = remaining.filter((node) =>
      [...(dependencies.get(node) ?? [])].every(
        (dependency) => dependency === node || !known.has(dependency) || done.has(dependency)
      )
    );

    if (!ready.length) {
      break;
    }

    for (const node of ready) {
      ordered.push(node);
      done.add(node);
    }

    remaining = remaining.filter((node) => !done.has(node));
  }

  return { ordered, cyclic: remaining };
};
