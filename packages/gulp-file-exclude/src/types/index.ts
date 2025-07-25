import type FileVinyl from 'vinyl';

// Definition of the options for the GulpFileExclude plugin.
export interface GulpFileExcludeOptions {
  patterns?: (string | RegExp)[];
  logExcluded?: boolean;
  size?: [
    min?: number,
    max?: number,
  ];
  onExclude?: (file: FileVinyl) => Promise<boolean>;
}
