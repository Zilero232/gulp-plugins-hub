import type { UserConfig } from 'tsdown';

/**
 * How every package builds: ESM for Node, with declarations, checked by publint. A package's tsdown.config.ts
 * spreads it and adds its entries.
 */
export const packageConfig = {
  format: 'esm',
  platform: 'node',
  target: 'node22.13',
  // Small pure helpers are bundled: one file to load instead of a package per helper.
  deps: {
    alwaysBundle: ['remeda', 'ts-pattern']
  },
  dts: true,
  clean: true,
  publint: true
} satisfies UserConfig;
