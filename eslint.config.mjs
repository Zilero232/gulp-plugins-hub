import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true,
    ignores: ['**/node_modules', '**/dist', 'coverage/**', '.pack/**', '**/*.md', '**/*.md/**', 'apps/example/src/**']
  },

  // The shared config applies these to every language it parses, and they throw
  // on JSON/YAML ("rules do not support the language jsonc/x").
  {
    name: 'hub/data-files',
    files: ['**/*.json', '**/*.jsonc', '**/*.yaml', '**/*.yml'],
    rules: {
      'arrow-body-style': 'off',
      'import/newline-after-import': 'off',
      'no-console': 'off',
      'prefer-template': 'off',
      'unicorn/no-typeof-undefined': 'off',
      'unicorn/no-useless-spread': 'off'
    }
  },

  {
    name: 'hub/typescript',
    files: ['**/*.?([cm])[jt]s?(x)'],
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'],
      'ts/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off'
    }
  },

  {
    name: 'hub/manifests',
    files: ['**/package.json', '**/tsconfig*.json'],
    rules: {
      'jsonc/sort-keys': 'off',
      // The order of `files` matters: a negated pattern only excludes what an earlier one included.
      'jsonc/sort-array-values': 'off'
    }
  },

  // Console is the output channel of scripts and of the example build.
  {
    name: 'hub/scripts',
    files: ['scripts/**', 'apps/example/**'],
    rules: {
      'no-console': 'off',
      'antfu/no-top-level-await': 'off'
    }
  }
);
