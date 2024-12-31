export interface GulpFolderCloneOptions {
	destFolder: string; // Folder to copy.
	overwrite?: boolean; // Overwrite existing files or not.
	excludeFiles?: (string | RegExp)[]; // List of files to exclude.
	logFinish: boolean; // Completion Log.
	fileFilter?: (file: FileVinyl) => boolean; // File Filter.
	onBeforeCopy?: (file: FileVinyl) => FileVinyl; // Function for additional actions before copying.
}
