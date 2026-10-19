import { prettier } from '@siberiacancode/prettier';

export default {
  ...prettier,
  printWidth: 120,
  // package.json in the conventional field order, scripts and dependencies sorted.
  plugins: [...(prettier.plugins ?? []), 'prettier-plugin-packagejson']
};
