import type { GulpPluginManagerOptions } from '../types';
import { NameFormatsTypes, ScopeDependencyTypes } from '../types';

const defaultOptions: GulpPluginManagerOptions = {
	scopes: [ScopeDependencyTypes.MainDependencies, ScopeDependencyTypes.DevDependencies, ScopeDependencyTypes.PeerDependencies],
	formatName: NameFormatsTypes.camelCase,
};

export default defaultOptions;
