import type { UserConfig } from '@commitlint/types';

import { COMMIT_TYPES } from './.jazzer.config.ts';

// Commits are made with commit-jazzer (`bun run commit`), so the types it offers are the ones allowed. The emoji
// sits right after the colon and starts the subject, which subject-case cannot judge.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 120],
    'subject-case': [0],
    'type-enum': [2, 'always', [...COMMIT_TYPES]]
  }
} satisfies UserConfig;
