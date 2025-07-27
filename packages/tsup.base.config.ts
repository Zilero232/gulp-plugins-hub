import type { Options } from 'tsup';

const baseConfig: Options = {
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: false,
  minify: true,
  silent: true,
  treeshake: true,
  outDir: 'dist',
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs'
  })
};

export default baseConfig;
