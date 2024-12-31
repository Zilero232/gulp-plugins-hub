// Cache types.
export enum CacheType {
	Memory = 'memory',
	File = 'file',
}

// Values of the cache type.
export type ValuesCacheType = `${CacheType}`;

// Options for comparing files.
interface ComparisonOptions {
	compareByHash?: boolean; // Whether to compare by hash.
	compareByName?: boolean; // Whether to compare by name.
	compareByExtension?: boolean; // Whether to compare by extension.
	compareByMtime?: boolean; // Whether to compare by modification time.
}

// Cache options
interface CacheOptions {
	cacheEnabled?: boolean; // Enables or disables caching.
	cacheFilePath?: string; // Path to save the cache to disk.
	cacheType?: ValuesCacheType; // Type of cache: in memory or on disk.
}

// Interface for plugin options
export interface GulpSmartChangesOptions {
	logStream?: boolean; // Log the processing of each file.
	logEnd?: boolean; // Log the completion of the process.
	targetDirectory: string; // Path to the target directory.
	ignorePatterns?: string[]; // File patterns to ignore.
	comparisonOptions?: ComparisonOptions; // Options for comparing files.
	cacheOptions?: CacheOptions; // Options for caching.
}
