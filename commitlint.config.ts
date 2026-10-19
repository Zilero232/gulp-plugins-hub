import type { UserConfig } from '@commitlint/types';

import { BUILT_IN_COMMIT_TYPE_NAMES } from 'commit-jazzer';

// Commits are made with commit-jazzer (`bun run commit`), so any of its types is allowed. The emoji sits right
// after the colon and starts the subject, which subject-case cannot judge.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 120],
    'subject-case': [0],
    'type-enum': [2, 'always', [...BUILT_IN_COMMIT_TYPE_NAMES]]
  }
} satisfies UserConfig;
