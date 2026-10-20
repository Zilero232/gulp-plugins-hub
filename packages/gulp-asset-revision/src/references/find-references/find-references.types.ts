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

export type GetCandidatesInput = {
  fromDir: string;
  assets: ReadonlySet<string>;
};
