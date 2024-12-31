import type { AutoprefixerOptions } from './modules/autoprefixer';
import type { CssNanoOptions } from './modules/cssnano';
import type { PostCssDiscardCommentsOptions } from './modules/postcssDiscardComments';
import type { PostCssFlexBugsFixesOptions } from './modules/postcssFlexBugsFixes';
import type { PostcssImportOptions } from './modules/postcssImport';
import type { PostCssMergeRulesOptions } from './modules/postcssMergeRules';
import type { PostCssPxToRemOptions } from './modules/postcssPxToRem';
import type { PostCssSvgoOptions } from './modules/postcssSvgo';
import type { PostCssSortingOptions } from './modules/postcssSorting';
import type { PostCssReporterOptions } from './modules/postcssReporter';
import type { NormalizeOptions } from './modules/postcssNormalize';
import type { PostCssNestedOptions } from './modules/postcssNested';
import type { PostCssMixinsOptions } from './modules/postcssMixins';

// List of supported plugins.
export enum PostCssPlugins {
	Autoprefixer = 'autoprefixer', // Автопрефиксер для добавления вендорных префиксов
	CssNano = 'cssnano', // Минификатор CSS
	PostCssNested = 'postcss-nested', // Плагин для вложенных стилей
	PostCssDiscardComments = 'postcss-discard-comments', // Удаление комментариев
	PostCssFlexBugsFixes = 'postcss-flexbugs-fixes', // Исправление багов Flexbox
	PostCssImport = 'postcss-import', // Импорт CSS файлов в другие CSS файлы
	PostCssMergeRules = 'postcss-merge-rules', // Слияние правил CSS
	PostCssMixins = 'postcss-mixins', // Использование миксинов в CSS
	PostCssNormalize = 'postcss-normalize', // Нормализация стилей
	PostCssPxToRem = 'postcss-pxtorem', // Преобразование PX в REM
	PostCssReporter = 'postcss-reporter', // Плагин для отчетов о CSS
	PostCssSorting = 'postcss-sorting', // Сортировка CSS свойств
	PostCssSvgo = 'postcss-svgo', // Оптимизация SVG
}

// Base options for all plugins.
interface BasePostCssOption {
	enabled: boolean; // Свойство enabled для активации плагина
}

// Keys for PostCssOptions.
export type KeysPostCssOptions = keyof PostCssOptions;

// Values for PostCssPlugins.
export type ValuesPostCssPlugins = `${PostCssPlugins}`;

// Options for PostCSS plugins.
export interface PostCssOptions {
	[PostCssPlugins.Autoprefixer]?: BasePostCssOption & AutoprefixerOptions;
	[PostCssPlugins.CssNano]?: BasePostCssOption & CssNanoOptions;
	[PostCssPlugins.PostCssNested]?: BasePostCssOption & PostCssNestedOptions;
	[PostCssPlugins.PostCssDiscardComments]?: BasePostCssOption & PostCssDiscardCommentsOptions;
	[PostCssPlugins.PostCssFlexBugsFixes]?: BasePostCssOption & PostCssFlexBugsFixesOptions;
	[PostCssPlugins.PostCssImport]?: BasePostCssOption & PostcssImportOptions;
	[PostCssPlugins.PostCssMergeRules]?: BasePostCssOption & PostCssMergeRulesOptions;
	[PostCssPlugins.PostCssMixins]?: BasePostCssOption & PostCssMixinsOptions;
	[PostCssPlugins.PostCssNested]?: BasePostCssOption & PostCssNestedOptions;
	[PostCssPlugins.PostCssNormalize]?: BasePostCssOption & NormalizeOptions;
	[PostCssPlugins.PostCssPxToRem]?: BasePostCssOption & PostCssPxToRemOptions;
	[PostCssPlugins.PostCssReporter]?: BasePostCssOption & PostCssReporterOptions;
	[PostCssPlugins.PostCssSorting]?: BasePostCssOption & PostCssSortingOptions;
	[PostCssPlugins.PostCssSvgo]?: BasePostCssOption & PostCssSvgoOptions;
}

// Options for the GulpScssSqueezer plugin.
export interface GulpScssSqueezerOptions {
	logStream?: boolean; // Log the processing of each file.
	logEnd?: boolean; // Log the completion of the process.
	skipFilesWithoutExtension?: boolean; // Skip files without an extension .html
	postCssPlugins?: PostCssOptions; // List of PostCSS plugins.
	onBeforeCompile?: (content: string) => string | Promise<string>; // Hook before minification.
	onAfterCompile?: (minifiedContent: string) => string | Promise<string>; // Hook after minification.
}
