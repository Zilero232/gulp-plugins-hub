import { defineConfig } from 'tsup';

import baseConfig from '../tsup.base.config'

export default defineConfig(() => {
  return {
    ...baseConfig,
    entry: ['src/index.ts'],
    tsconfig: 'tsconfig.json',
  };
});
