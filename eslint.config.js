import antfu from '@antfu/eslint-config';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default antfu(
	{
		// Settings for base  configuration.
		gitignore: true,
		typescript: {
			tsconfigPath: 'tsconfig.base.json',
		},
		formatters: true,
		stylistic: {
			indent: 'tab',
			semi: true,
			jsx: false,
			arrowParens: 'always',
		},

		// Ignored files and folders.
		ignores: ['node_modules', '**/build/**', '**/dist/**', '**/coverage/**'],
	},
	{
		name: '@zilero/rewrite',
		rules: {
			'antfu/top-level-function': 'off',
			'antfu/if-newline': 'off',
			'antfu/curly': 'off',
			'antfu/brace-style': 'off',

			'test/prefer-lowercase-title': 'off',

			'no-console': 'warn',
		},
	},
	{
		name: '@zilero/imports',
		rules: {
			'sort-imports': 'off',
			'import/order': 'off',
			'import/extensions': 'off',
			'perfectionist/sort-imports': 'off',
		},
	},
	{
		// Connecting Prettier for formatting.
		name: '@zilero/prettier',
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			...eslintConfigPrettier.rules,
			...eslintPluginPrettierRecommended.rules,
			'prettier/prettier': [
				'error',
				{
					printWidth: 150,
					singleQuote: true,
					trailingComma: 'all',
					semi: true,
					tabWidth: 2,
					useTabs: true,
					endOfLine: 'lf',
					arrowParens: 'always',
				},
			],
		},
	},
);
