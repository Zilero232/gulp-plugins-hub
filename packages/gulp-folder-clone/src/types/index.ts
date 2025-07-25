// Options for the GulpFolderClone plugin.
export interface GulpFolderCloneOptions {
  logProgress?: boolean;
  logFinish?: boolean;
  onBeforeCopy?: (file: FileVinyl) => FileVinyl | Promise<FileVinyl>;
}
