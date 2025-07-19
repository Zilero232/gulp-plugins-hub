import type { Options } from 'tsup';

const baseConfig: Options = {
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true
};

export default baseConfig;
