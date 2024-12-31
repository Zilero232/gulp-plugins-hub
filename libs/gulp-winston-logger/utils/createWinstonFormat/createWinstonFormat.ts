import type { Logform as logform } from 'winston';
import { format as winstonFormat } from 'winston';

import {
	createAlignFormat,
	createCliFormat,
	createColorizeFormat,
	createErrorsFormat,
	createJsonFormat,
	createLabelFormat,
	createLogstashFormat,
	createMetadataFormat,
	createMsFormat,
	createPadLevelsFormat,
	createPrettyPrintFormat,
	createPrintfFormat,
	createSimpleFormat,
	createSplatFormat,
	createTimestampFormat,
	createUncolorizeFormat,
} from '../../helpers/formatHelpers';

import type { FormatOptions } from '../../types';

interface CreateWinstonFormatProps {
	pluginName: string;
	options: FormatOptions;
}

/**
 * Creates a winston format, given a boolean or format options.
 * If boolean, it will return the default options. If format options, it will
 * merge the options with the default options and return the result.
 * The following formats are supported: align, cli, colorize, errors, json,
 * label, logstash, metadata, ms, padLevels, prettyPrint, printf, simple,
 * splat, timestamp, and uncolorize.
 *
 * @returns {logform.Format}
 */
export function createWinstonFormat({ pluginName, options }: CreateWinstonFormatProps): logform.Format {
	const formats: logform.Format[] = [];

	if (options.align) {
		formats.push(createAlignFormat(options.align));
	}

	if (options.cli) {
		formats.push(createCliFormat(options.cli));
	}

	if (options.colorize) {
		formats.push(createColorizeFormat(options.colorize));
	}

	if (options.errors) {
		formats.push(createErrorsFormat(options.errors));
	}

	if (options.json) {
		formats.push(createJsonFormat(options.json));
	}

	if (options.label) {
		formats.push(createLabelFormat(options.label));
	}

	if (options.logstash) {
		formats.push(createLogstashFormat(options.logstash));
	}

	if (options.metadata) {
		formats.push(createMetadataFormat(options.metadata));
	}

	if (options.ms) {
		formats.push(createMsFormat(options.ms));
	}

	if (options.padLevels) {
		formats.push(createPadLevelsFormat(options.padLevels));
	}

	if (options.prettyPrint) {
		formats.push(createPrettyPrintFormat(options.prettyPrint));
	}

	if (options.printf) {
		formats.push(createPrintfFormat(pluginName, options.printf));
	}

	if (options.simple) {
		formats.push(createSimpleFormat(options.simple));
	}

	if (options.splat) {
		formats.push(createSplatFormat(options.splat));
	}

	if (options.timestamp) {
		formats.push(createTimestampFormat(options.timestamp));
	}

	if (options.uncolorize) {
		formats.push(createUncolorizeFormat(options.uncolorize));
	}

	return winstonFormat.combine(...formats);
}
