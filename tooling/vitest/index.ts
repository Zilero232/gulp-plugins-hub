import { defineProject } from 'vitest/config';

// Workspace packages resolve to their TypeScript sources, so tests never wait for a build.
const conditions = ['@zilero/source'];

/** The Vitest project every package uses: `export default projectConfig` in its vitest.config.ts. */
export const projectConfig = defineProject({
  resolve: { conditions },
  ssr: { resolve: { conditions, externalConditions: conditions } },
  test: {
    environment: 'node',
    include: ['src/**/_tests/**/*.test.ts'],
    restoreMocks: true,
    unstubEnvs: true
  }
});
