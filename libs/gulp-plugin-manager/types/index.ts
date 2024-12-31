// Defining the type for the scope dependency type.
export enum ScopeDependencyTypes {
	MainDependencies = 'dependencies',
	DevDependencies = 'devDependencies',
	PeerDependencies = 'peerDependencies',
}

// Defining the type for the name formats.
export enum NameFormatsTypes {
	camelCase = 'camelCase', // Example: myVariableName
	kebabCase = 'kebabCase', // Example: my-variable-name
	snakeCase = 'snakeCase', // Example: my_variable_name
	pascalCase = 'pascalCase', // Example: MyVariableName
	upperCase = 'upperCase', // Example: MYVARIABLENAME
	lowerCase = 'lowerCase', // Example: myvariablename
	constantCase = 'constantCase', // Example: MY_VARIABLE_NAME
}

// Defining the type for the scope dependency values.
export type ScopeDependencyValues = `${ScopeDependencyTypes}`;

// Defining the type for the name formats values.
export type NameFormatsValues = `${NameFormatsTypes}`;

// Defining the type for the plugin.
export type GulpPlugin = (...args: unknown[]) => unknown;

// Defining the type for the plugin object.
export type GulpPluginObject = Record<string, GulpPlugin>;

// Defining the type for the pattern options.
export interface PatternOptions {
	patterns?: (string | RegExp)[]; // String or regular expressions for searching.
	excludePatterns?: (string | RegExp)[]; // String or regular expressions for exclusion.
	overridePatterns?: boolean; // Replaces the basic templates if true.
	overrideExcludePatterns?: boolean; // Replaces the basic templates if true.
	maxResults?: number; // Limit on the number of results.
	useFullMatchRegex?: boolean; // Full match for regular expressions.
	allowPartialMatchString?: boolean; // Partial match for string patterns.
}

// Defining the type for the options GulpPluginManager.
export interface GulpPluginManagerOptions {
	patternOptions?: PatternOptions; // Plugin Search Templates.
	configPath?: string; // Configuration file path.
	scopes?: ScopeDependencyValues[]; // Which sections of the package.use json to find dependencies.
	replaceString?: RegExp; // Regular expression for removing prefixes.
	formatName?: NameFormatsValues; // Convert plugin names.
	lazy?: boolean; // Lazy loading of plugins.
	rename?: Record<string, string>; // Renaming plugins.
	minVersions?: Record<string, string>; // Minimum plugin versions.
	renameFn?: (name: string) => string; // Function for processing names.
}
