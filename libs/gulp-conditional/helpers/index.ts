// Get file extension.
export const getFileExtension = (file: FileVinyl): string => {
	const parts = file.path.split('.');

	return parts.length > 1 ? parts.pop() || '' : '';
};

// Get file name.
export const getFileName = (file: FileVinyl): string => {
	const parts = file.path.split('/');

	return parts.pop() || '';
};

// Get file size.
export const getFileSize = (file: FileVinyl): number => {
	return file.contents.length;
};

// Get file modification date.
export const getFileModificationDate = (file: FileVinyl): Date => {
	return file.stat.mtime;
};

// Get file creation date.
export const getFileCreationDate = (file: FileVinyl): Date => {
	return file.stat.ctime;
};

// Check if file contains specific content.
export const fileContainsContent = (file: FileVinyl, content: string): boolean => {
	const fileContent = file.contents.toString('utf8');

	return fileContent.includes(content);
};

// Check if file path contains a specific string.
export const filePathContains = (file: FileVinyl, pathPart: string): boolean => {
	return file.path.includes(pathPart);
};
