import type { Targets } from 'lightningcss';

/** The Lightning CSS targets for the file at this path. */
export type TargetsResolver = (filePath: string) => Targets;
