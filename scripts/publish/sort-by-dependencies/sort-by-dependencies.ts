import type { Workspace } from '../publish.types';

const workspaceDependencies = (workspace: Workspace): string[] => {
  const { dependencies, peerDependencies, optionalDependencies } = workspace.manifest;

  return Object.keys({ ...dependencies, ...peerDependencies, ...optionalDependencies });
};

/**
 * Dependencies before the packages that use them (the factory before the plugins), so nobody installs a plugin
 * whose new factory version is not on npm yet. A package's depth is its longest chain of workspace dependencies;
 * the sort is stable, so packages of the same depth keep their order. A dependency cycle is an error.
 */
export const sortByDependencies = (workspaces: Workspace[]): Workspace[] => {
  const byName = new Map(workspaces.map((workspace) => [workspace.manifest.name, workspace]));
  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  const depthOf = (workspace: Workspace): number => {
    const { name } = workspace.manifest;
    const known = depths.get(name);

    if (known !== undefined) {
      return known;
    }

    if (visiting.has(name)) {
      throw new Error(`Workspace dependency cycle through ${name}`);
    }

    visiting.add(name);

    const internal = workspaceDependencies(workspace).flatMap((dependency) => byName.get(dependency) ?? []);
    const depth = Math.max(0, ...internal.map((dependency) => depthOf(dependency) + 1));

    visiting.delete(name);
    depths.set(name, depth);

    return depth;
  };

  return [...workspaces].sort((a, b) => depthOf(a) - depthOf(b));
};
