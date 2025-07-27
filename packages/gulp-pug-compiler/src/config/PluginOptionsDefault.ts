import type { GulpPugCompilerOptions } from '../schema';

const defaultOptions: GulpPugCompilerOptions = {
  pluginOptions: {
    logFinal: true,
    logProgress: true,
  }
};

export default defaultOptions;
