export type Match = {
  text: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
  /** Whether the RegExp has named groups at all: `$<name>` stays as written when it has none. */
  hasNamedGroups: boolean;
  index: number;
};
