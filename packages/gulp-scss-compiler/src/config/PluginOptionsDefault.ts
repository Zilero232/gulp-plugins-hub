import type { GulpScssSqueezerOptions } from '../schema';

const defaultOptions: GulpScssSqueezerOptions = {
  scssOptions: {
    sourceMap: true,
  },
  pluginOptions: {
    renameDir: 'css',
  },
};

export default defaultOptions;
