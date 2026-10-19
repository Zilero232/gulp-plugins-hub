export type OrderByDependenciesInput = {
  /** Every node, in the order to keep among nodes that do not depend on each other. */
  nodes: string[];
  /** What each node depends on; dependencies that are not nodes are ignored. */
  dependencies: ReadonlyMap<string, ReadonlySet<string>>;
};

export type DependencyOrder = {
  /** Every node after the nodes it depends on. */
  ordered: string[];
  /** The nodes on a cycle or depending on one: no order puts them after all their dependencies. */
  cyclic: string[];
};
