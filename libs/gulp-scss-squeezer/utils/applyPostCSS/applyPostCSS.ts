import type { AcceptedPlugin } from 'postcss';
import postcss from 'postcss';

// PostCSS plugins
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import postcssDiscardComments from 'postcss-discard-comments';
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes';
import postcssImport from 'postcss-import';
import postcssMergeRules from 'postcss-merge-rules';
import postcssMixins from 'postcss-mixins';
import postcssNested from 'postcss-nested';
import postcssNormalize from 'postcss-normalize';
import postcssPxtorem from 'postcss-pxtorem';
import postcssReporter from 'postcss-reporter';
import postcssSorting from 'postcss-sorting';
import postcssSvgo from 'postcss-svgo';

import validatePluginOptions from '../../helpers/validatePluginOptions';

import type { PostCssOptions } from '../../types';
import { PostCssPlugins } from '../../types';

interface ApplyPostCSS {
	content: string;
	options: PostCssOptions;
}

/**
 * Applies PostCSS plugins to the given CSS content.
 *
 * @param {ApplyPostCSS} data - Data for applying PostCSS plugins.
 * @param {string} data.content - CSS content to be processed.
 * @param {PostCssOptions} data.postCssOptions - Options for PostCSS plugins.
 *
 * @returns {Promise<string>} - Processed CSS content.
 */
const applyPostCSS = async ({ content, options }: ApplyPostCSS): Promise<string> => {
	const postcssPlugins: AcceptedPlugin[] = [];

	// Проверяем, если плагин cssnano включен, для минификации CSS
	if (
		validatePluginOptions<PostCssPlugins.CssNano>({
			pluginName: PostCssPlugins.CssNano,
			pluginOptions: options[PostCssPlugins.CssNano],
		})
	) {
		postcssPlugins.push(cssnano(options[PostCssPlugins.CssNano]?.options));
	}

	// Проверяем, если плагин autoprefixer включен, для добавления вендорных префиксов
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.Autoprefixer,
			pluginOptions: options[PostCssPlugins.Autoprefixer],
		})
	) {
		postcssPlugins.push(autoprefixer(options[PostCssPlugins.Autoprefixer]?.options));
	}

	// Проверяем, если плагин postcss-discard-comments включен, для удаления комментариев
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssDiscardComments,
			pluginOptions: options[PostCssPlugins.PostCssDiscardComments],
		})
	) {
		postcssPlugins.push(postcssDiscardComments(options[PostCssPlugins.PostCssDiscardComments]?.options));
	}

	// Проверяем, если плагин postcss-flexbugs-fixes включен, для исправления flexbox багов
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssFlexBugsFixes,
			pluginOptions: options[PostCssPlugins.PostCssFlexBugsFixes],
		})
	) {
		postcssPlugins.push(postcssFlexbugsFixes(options[PostCssPlugins.PostCssFlexBugsFixes]?.options));
	}

	// Проверяем, если плагин postcss-import включен, для импорта CSS-файлов
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssImport,
			pluginOptions: options[PostCssPlugins.PostCssImport],
		})
	) {
		postcssPlugins.push(postcssImport(options[PostCssPlugins.PostCssImport]?.options));
	}

	// Проверяем, если плагин postcss-merge-rules включен, для объединения похожих CSS-правил
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssMergeRules,
			pluginOptions: options[PostCssPlugins.PostCssMergeRules],
		})
	) {
		postcssPlugins.push(postcssMergeRules(options[PostCssPlugins.PostCssMergeRules]?.options));
	}

	// Проверяем, если плагин postcss-mixins включен, для использования миксинов в CSS
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssMixins,
			pluginOptions: options[PostCssPlugins.PostCssMixins],
		})
	) {
		postcssPlugins.push(postcssMixins(options[PostCssPlugins.PostCssMixins]?.options));
	}

	// Проверяем, если плагин postcss-nested включен, для использования вложенных селекторов
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssNested,
			pluginOptions: options[PostCssPlugins.PostCssNested],
		})
	) {
		postcssPlugins.push(postcssNested(options[PostCssPlugins.PostCssNested]?.options));
	}

	// Проверяем, если плагин postcss-normalize включен, для использования normalize.css
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssNormalize,
			pluginOptions: options[PostCssPlugins.PostCssNormalize],
		})
	) {
		postcssPlugins.push(postcssNormalize(options[PostCssPlugins.PostCssNormalize]?.options));
	}

	// Проверяем, если плагин postcss-pxtorem включен, для конвертации px в rem
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssPxToRem,
			pluginOptions: options[PostCssPlugins.PostCssPxToRem],
		})
	) {
		postcssPlugins.push(postcssPxtorem(options[PostCssPlugins.PostCssPxToRem]?.options));
	}

	// Проверяем, если плагин postcss-reporter включен, для вывода сообщений об ошибках и предупреждениях
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssReporter,
			pluginOptions: options[PostCssPlugins.PostCssReporter],
		})
	) {
		postcssPlugins.push(postcssReporter(options[PostCssPlugins.PostCssReporter]?.options));
	}

	// Проверяем, если плагин postcss-sorting включен, для сортировки CSS-свойств
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssSorting,
			pluginOptions: options[PostCssPlugins.PostCssSorting],
		})
	) {
		postcssPlugins.push(postcssSorting(options[PostCssPlugins.PostCssSorting]?.options));
	}

	// Проверяем, если плагин postcss-svgo включен, для оптимизации SVG-файлов
	if (
		validatePluginOptions({
			pluginName: PostCssPlugins.PostCssSvgo,
			pluginOptions: options[PostCssPlugins.PostCssSvgo],
		})
	) {
		postcssPlugins.push(postcssSvgo(options[PostCssPlugins.PostCssSvgo]?.options));
	}

	// Применяем плагин которые включены в настройках
	if (postcssPlugins.length > 0) {
		const result = await postcss(postcssPlugins).process(content);

		return result.content;
	}

	return content;
};

export default applyPostCSS;
