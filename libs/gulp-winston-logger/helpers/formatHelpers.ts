import type { Logform as logform } from 'winston';
import { format as winstonFormat } from 'winston';
import chalk from 'chalk';

import { InvalidFormatError } from '@shared/utils';
import { isBoolean, isFunction, isObject, isString } from '@shared/helpers/typeHelpers';

import { getTimestampFormat } from '../utils';

import type { ColorizeOptions, FormatOptions } from '../types';

/**
 * Creates a winston align format, given a boolean.
 * If boolean, it will return the default align options.
 *
 * @returns {logform.Format}
 */
export function createAlignFormat(AlignOption: FormatOptions['align']): logform.Format {
	if (isBoolean(AlignOption)) {
		return winstonFormat.align();
	}

	throw new InvalidFormatError({
		fieldName: 'align',
		receivedValue: AlignOption,
		expectedType: 'boolean',
	});
}

/**
 * Creates a winston cli format, given a boolean or CliOptions.
 * If boolean, it will return the default cli options.
 * If CliOptions, it will return the cli format with the given options.
 *
 * @returns {logform.Format}
 */
export function createCliFormat(CliOption: FormatOptions['cli']): logform.Format {
	if (isBoolean(CliOption)) {
		return winstonFormat.cli();
	}

	if (isObject(CliOption)) {
		return winstonFormat.cli(CliOption);
	}

	throw new InvalidFormatError({
		fieldName: 'cli',
		expectedType: 'boolean or CliOptions',
		receivedValue: CliOption,
	});
}

/**
 * Creates a winston colorize format, given a boolean or ColorizeOptions.
 * If boolean, it will return the default colorize options.
 * If ColorizeOptions, it will return the colorize format with the given options.
 *
 * @returns {logform.Format}
 */
export function createColorizeFormat(colorizeOption: FormatOptions['colorize']): logform.Format {
	const defaultColorizeOption: ColorizeOptions = {
		colors: {
			error: 'red',
			warn: 'yellow',
			info: 'green',
			http: 'magenta',
			verbose: 'cyan',
			debug: 'blue',
			silly: 'gray',
		},
	};

	if (isBoolean(colorizeOption)) {
		return winstonFormat.colorize(defaultColorizeOption);
	}

	if (isObject(colorizeOption)) {
		return winstonFormat.colorize(colorizeOption);
	}

	throw new InvalidFormatError({
		fieldName: 'colorize',
		expectedType: 'boolean or ColorizeOptions',
		receivedValue: colorizeOption,
	});
}

/**
 * Creates a winston errors format, given a boolean or errorsOption.
 * If boolean, it will return the default errors options with stack set to false.
 * If errorsOption, it will return the errors format with the given options.
 *
 * @returns {logform.Format}
 */
export function createErrorsFormat(errorsOption: FormatOptions['errors']): logform.Format {
	if (isBoolean(errorsOption)) {
		return winstonFormat.errors({ stack: false });
	}

	if (isObject(errorsOption)) {
		return winstonFormat.errors(errorsOption);
	}

	throw new InvalidFormatError({
		fieldName: 'errors',
		expectedType: 'boolean or errorsOption',
		receivedValue: errorsOption,
	});
}

/**
 * Creates a winston json format, given a boolean or jsonOption.
 * If boolean, it will return the default json options.
 * If jsonOption, it will return the json format with the given options.
 *
 * @returns {logform.Format}
 */
export function createJsonFormat(jsonOption: FormatOptions['json']): logform.Format {
	if (isBoolean(jsonOption)) {
		return winstonFormat.json();
	}

	if (isObject(jsonOption)) {
		return winstonFormat.json(jsonOption);
	}

	throw new InvalidFormatError({
		fieldName: 'json',
		expectedType: 'boolean or JsonOptions',
		receivedValue: jsonOption,
	});
}

/**
 * Creates a winston label format, given a string or LabelOptions.
 * If string, it will return the label format with the given label.
 * If LabelOptions, it will return the label format with the given options.
 *
 * @returns {logform.Format}
 */
export function createLabelFormat(labelOption: FormatOptions['label']): logform.Format {
	if (isString(labelOption)) {
		return winstonFormat.label({ label: labelOption });
	}

	if (isObject(labelOption)) {
		return winstonFormat.label(labelOption);
	}

	throw new InvalidFormatError({
		fieldName: 'label',
		expectedType: 'string or LabelOptions',
		receivedValue: labelOption,
	});
}

/**
 * Creates a winston logstash format, given a boolean.
 * If boolean, it will return the default logstash options.
 *
 * @returns {logform.Format}
 */
export function createLogstashFormat(LogstashOption: FormatOptions['logstash']): logform.Format {
	if (isBoolean(LogstashOption)) {
		return winstonFormat.logstash();
	}

	throw new InvalidFormatError({
		fieldName: 'logstash',
		expectedType: 'boolean',
		receivedValue: LogstashOption,
	});
}

/**
 * Creates a winston metadata format, given a boolean or MetadataOptions.
 * If boolean, it will return the default metadata options.
 * If MetadataOptions, it will return the metadata format with the given options.
 *
 * @returns {logform.Format}
 */
export function createMetadataFormat(metadataOption: FormatOptions['metadata']): logform.Format {
	if (isBoolean(metadataOption)) {
		return winstonFormat.metadata();
	}

	if (isObject(metadataOption)) {
		return winstonFormat.metadata(metadataOption);
	}

	throw new InvalidFormatError({
		fieldName: 'metadata',
		expectedType: 'boolean or MetadataOptions',
		receivedValue: metadataOption,
	});
}

/**
 * Creates a winston ms format, given a boolean.
 * If boolean, it will return the default ms options.
 *
 * @returns {logform.Format}
 */
export function createMsFormat(MsOption: FormatOptions['ms']): logform.Format {
	if (isBoolean(MsOption)) {
		return winstonFormat.ms();
	}

	throw new InvalidFormatError({
		fieldName: 'ms',
		expectedType: 'boolean',
		receivedValue: MsOption,
	});
}

/**
 * Creates a winston padLevels format, given a boolean or PadLevelsOptions.
 * If boolean, it will return the default padLevels options.
 * If PadLevelsOptions, it will return the padLevels format with the given options.
 *
 * @returns {logform.Format}
 */
export function createPadLevelsFormat(padLevelsOption: FormatOptions['padLevels']): logform.Format {
	if (isBoolean(padLevelsOption)) {
		return winstonFormat.padLevels();
	}

	if (isObject(padLevelsOption)) {
		return winstonFormat.padLevels(padLevelsOption);
	}

	throw new InvalidFormatError({
		fieldName: 'padLevels',
		expectedType: 'boolean or PadLevelsOptions',
		receivedValue: padLevelsOption,
	});
}

/**
 * Creates a winston prettyPrint format, given a boolean or PrettyPrintOptions.
 * If boolean, it will return the default prettyPrint options.
 * If PrettyPrintOptions, it will return the prettyPrint format with the given options.
 *
 * @returns {logform.Format}
 */
export function createPrettyPrintFormat(prettyPrintOption: FormatOptions['prettyPrint']): logform.Format {
	if (isBoolean(prettyPrintOption)) {
		return winstonFormat.prettyPrint();
	}

	if (isObject(prettyPrintOption)) {
		return winstonFormat.prettyPrint(prettyPrintOption);
	}

	throw new InvalidFormatError({
		fieldName: 'prettyPrint',
		expectedType: 'boolean or PrettyPrintOptions',
		receivedValue: prettyPrintOption,
	});
}

/**
 * Creates a winston printf format, given a boolean or a custom format function.
 * If boolean, it will return the default printf format with the following format:
 * - timestamp (if provided)
 * - log level
 * - plugin name
 * - log message
 * - error stack (if provided)
 * - metadata (if present)
 * If custom format function, it will return the format with the given function.
 *
 * @returns {logform.Format}
 */
export function createPrintfFormat(pluginName: string, printfOption: FormatOptions['printf']): logform.Format {
	if (isBoolean(printfOption)) {
		return winstonFormat.printf(({ timestamp, level, message, stack, ...meta }) => {
			let logOutput = '';

			// If the timestamp is passed, add it before the rest of the fields.
			if (timestamp) {
				logOutput = `${chalk.gray(timestamp)} `;
			}

			// If there is an error stack, add it after the message.
			if (stack) {
				logOutput += `\n${chalk.red('Stack')}: ${stack}`;
			}

			// Adding the log level, the plugin name and a message with colors.
			logOutput += `[${chalk.blue(level)}] Plugin: ${chalk.green(pluginName)} - ${chalk.cyan(message)}`;

			// Processing the rest of the metadata.
			Object.entries(meta).forEach(([key, value]) => {
				switch (value) {
					case isBoolean(value):
						// For Boolean values, we show true/false.
						logOutput += `\n${chalk.magenta(key)}: ${chalk.yellow(value)}`;
					case isObject(value):
						// If the value is an object, output the key and formatted JSON.
						logOutput += `\n${chalk.magenta(key)}: ${chalk.yellow(JSON.stringify(value, null, 2))}`;
					default:
						// Otherwise, just output the key and its value.
						logOutput += `\n${chalk.magenta(key)}: ${chalk.yellow(value)}`;
				}
			});

			return logOutput;
		});
	}

	if (isFunction(printfOption)) {
		return winstonFormat.printf(printfOption);
	}

	throw new InvalidFormatError({
		fieldName: 'printf',
		expectedType: 'boolean or Function',
		receivedValue: printfOption,
	});
}

/**
 * Creates a winston timestamp format, given a boolean or TimestampOptions.
 * If boolean, it will return the default timestamp options.
 * If TimestampOptions, it will return the timestamp format with the given options.
 * The format of the timestamp is determined by the getTimestampFormat utility function.
 *
 * @returns {logform.Format}
 */
export function createTimestampFormat(timestampOption: FormatOptions['timestamp']): logform.Format {
	if (isBoolean(timestampOption)) {
		return winstonFormat.timestamp();
	}

	if (isObject(timestampOption)) {
		return winstonFormat.timestamp({
			format: getTimestampFormat({ timestampOption: timestampOption.format ?? '' }),
		});
	}

	throw new InvalidFormatError({
		fieldName: 'timestamp',
		expectedType: 'boolean or TimestampOptions',
		receivedValue: timestampOption,
	});
}

/**
 * Creates a winston simple format, given a boolean.
 * If boolean, it will return the default simple options.
 *
 * @returns {logform.Format}
 */
export function createSimpleFormat(simpleOption: FormatOptions['simple']): logform.Format {
	if (isBoolean(simpleOption)) {
		return winstonFormat.simple();
	}

	throw new InvalidFormatError({
		fieldName: 'simple',
		expectedType: 'boolean',
		receivedValue: simpleOption,
	});
}

/**
 * Creates a winston splat format, given a boolean.
 * If boolean, it will return the default splat options.
 *
 * @returns {logform.Format}
 */
export function createSplatFormat(splatOption: FormatOptions['splat']): logform.Format {
	if (isBoolean(splatOption)) {
		return winstonFormat.splat();
	}

	throw new InvalidFormatError({
		fieldName: 'splat',
		expectedType: 'boolean',
		receivedValue: splatOption,
	});
}

/**
 * Creates a winston uncolorize format, given a boolean or UncolorizeOptions.
 * If boolean, it will return the default uncolorize options.
 * If UncolorizeOptions, it will return the uncolorize format with the given options.
 *
 * @returns {logform.Format}
 */
export function createUncolorizeFormat(uncolorizeOption: FormatOptions['uncolorize']): logform.Format {
	if (isBoolean(uncolorizeOption)) {
		return winstonFormat.uncolorize();
	}

	if (isObject(uncolorizeOption)) {
		return winstonFormat.uncolorize(uncolorizeOption);
	}

	throw new InvalidFormatError({
		fieldName: 'uncolorize',
		expectedType: 'boolean or UncolorizeOptions',
		receivedValue: uncolorizeOption,
	});
}
