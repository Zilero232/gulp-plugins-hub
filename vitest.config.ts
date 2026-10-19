import { defineConfig } from 'vitest/config';

// `bun run test:coverage`: every package at once with one coverage report. `bun run test` runs the same
// projects one package at a time through turbo, with its cache.
export default defineConfig({
  test: {
    projects: [
      'packages/*',
      { test: { name: 'scripts', environment: 'node', include: ['scripts/**/_tests/**/*.test.ts'] } }
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // CI fails when coverage drops below these.
      thresholds: { lines: 90, branches: 85, functions: 90, statements: 90 },
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/_tests/**', '**/*.types.ts', '**/index.ts']
    }
  }
});
