import hashFileContents from '../../helpers/hashFileContents';

interface CompareByHashOptions {
	cacheEnabled: boolean;
}

interface CheckHashMatchProps {
	filePath: string;
	fileContents: string;
	cache: Map<string, string>;
	options: CompareByHashOptions;
}

export const checkHashMatch = async ({ filePath, fileContents, cache, options }: CheckHashMatchProps): Promise<boolean> => {
	const { cacheEnabled = true } = options;

	if (!fileContents) {
		return false;
	}

	// Get the hash of the file from the cache.
	const cachedHash = cache.get(filePath);

	// Get the hash of the content from the current file.
	const currentHash = await hashFileContents({ content: fileContents });

	// If the hashes match, then we return the file.
	if (cachedHash === currentHash) {
		return true;
	}

	// If the cache is enabled, then save it.
	if (cacheEnabled) {
		cache.set(filePath, currentHash);
	}

	return false;
};
