import { GulpPluginManagerOptions, ScopeDependencyTypes, NameFormatsTypes } from "../types";

const defaultOptions: GulpPluginManagerOptions = {
  scopes: [ScopeDependencyTypes.MainDependencies, ScopeDependencyTypes.DevDependencies, ScopeDependencyTypes.PeerDependencies],
  formatName: NameFormatsTypes.camelCase,
};

export default defaultOptions;
