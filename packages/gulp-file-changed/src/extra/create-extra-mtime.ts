import { getNewestMtime } from './get-newest-mtime';

/**
 * Returns the newest modification time among the `extra` files, looked up once per stream and working directory:
 * a watch build creates a new stream for each run, so every run sees the current files.
 */
export const createExtraMtime = (patterns: string[]): ((cwd: string) => Promise<number | undefined>) => {
  const byCwd = new Map<string, Promise<number | undefined>>();

  return async (cwd) => {
    if (patterns.length === 0) {
      return undefined;
    }

    const cached = byCwd.get(cwd) ?? getNewestMtime({ patterns, cwd });

    byCwd.set(cwd, cached);

    return cached;
  };
};
