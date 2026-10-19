import { packageConfig } from '@gulp-plugins-hub/tsdown-config';
import { defineConfig } from 'tsdown';

export default defineConfig({
  ...packageConfig,
  entry: {
    index: './src/index.ts',
    testing: './src/testing/index.ts'
  }
});
