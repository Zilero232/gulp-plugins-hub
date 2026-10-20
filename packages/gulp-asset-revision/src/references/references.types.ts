export type FindReferencesInput = {
  content: string;
  /** The referencing file's folder relative to the base: `.` or `css`. */
  fromDir: string;
  /** Every asset that can be referenced, relative to the base. */
  assets: ReadonlySet<string>;
  /**
   * Every file of the stream, assets or not: a reference resolves to the file a browser would load, and is
   * returned only when that file is an asset. Default: the assets.
   */
  files?: ReadonlySet<string>;
};
