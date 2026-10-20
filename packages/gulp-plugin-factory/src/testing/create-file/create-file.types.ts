export type CreateFileInput = {
  /** Path relative to `base`; default `file.txt`. */
  path?: string;
  /** A string is stored as a UTF-8 Buffer; `null` makes a file without contents. Default: empty. */
  contents?: string | Buffer | NodeJS.ReadableStream | null;
  /** Default `/project`. */
  cwd?: string;
  /** Default `<cwd>/src`. */
  base?: string;
  /** Starts an empty source map, like `src(…, { sourcemaps: true })` does. */
  sourceMap?: boolean;
};
