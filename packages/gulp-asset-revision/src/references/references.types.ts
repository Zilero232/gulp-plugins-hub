import type { RevisionManifest } from '../asset-revision.types';

/** A reference to an asset found in a text file. */
export type Reference = {
  /** Where the path starts in the text, after any `/` or `./` prefix. */
  start: number;
  end: number;
  /** The asset it points at, relative to the base. */
  target: string;
  /** Whether the text is relative to the referencing file (`../img/a.png`) rather than to the base. */
  fileRelative: boolean;
};

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

export type RewriteReferencesInput = FindReferencesInput & {
  revisions: RevisionManifest;
};

export type GetCandidatesInput = {
  fromDir: string;
  assets: ReadonlySet<string>;
};
