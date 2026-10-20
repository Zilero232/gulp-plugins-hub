import type { BuiltFromInput } from './utils.types.ts';

/** Whether a dist/ file was built from a source with this stem: `hero.webp`, `hero-640w.jpg` for `hero.jpg`. */
export const isBuiltFrom = ({ entry, stem }: BuiltFromInput): boolean =>
  entry.startsWith(stem) && /^(?:-\d+w)?\.\w+$/.test(entry.slice(stem.length));
