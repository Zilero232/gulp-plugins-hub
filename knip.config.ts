import type { KnipConfig } from 'knip';

export default {
  workspaces: {
    '.': {
      entry: ['scripts/*/index.ts', '.jazzer.config.ts'],
      project: ['scripts/**/*.ts', '*.ts']
    },
    'packages/*': {
      project: ['src/**/*.ts']
    },
    'apps/docs': {
      // vitepress-plugin-llms needs vite 5 next to VitePress for its types (see docs/tsconfig.json).
      ignoreDependencies: ['vite']
    },
    'apps/example': {
      entry: ['gulpfile.ts', 'test/**/*.test.ts'],
      project: ['gulpfile.ts', 'gulp/**/*.ts', 'test/**/*.ts'],
      // gulp-cli loads esbuild-register itself to run gulpfile.ts.
      ignoreDependencies: ['esbuild-register']
    }
  }
} satisfies KnipConfig;
