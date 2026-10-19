export type SubsetSfntInput = {
  sfnt: Buffer;
  /** The characters of a string, or Unicode code points. */
  subset: string | number[];
  hinting: boolean;
};
