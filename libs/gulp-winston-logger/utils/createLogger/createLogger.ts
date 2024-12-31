import { createLogger, type Logger, type LoggerOptions } from 'winston';
import chalk from 'chalk';

import { createTransportsOptions, createWinstonFormat } from '../';

import type { GulpWinstonLoggerOptions } from '../../types';

interface CreateWinstonLoggerProps {
	pluginName: string;
	options: GulpWinstonLoggerOptions;
}

/**
 * Creates a winston logger with a given plugin name and options.
 *
 * @returns {Logger} - A winston logger.
 */
export const createWinstonLogger = ({ pluginName, options }: CreateWinstonLoggerProps): Logger => {
	const transports = createTransportsOptions({
		pluginName,
		options: {
			console: true,
			...options.transports,
		},
	});

	if (!transports.length) {
		throw new Error(`${chalk.red('Error:')} ${chalk.yellow('No transports configured')} ${chalk.cyan('check the config')}`);
	}

	const loggerOptions: LoggerOptions = {
		...options,
		level: 'error',
		format: createWinstonFormat({
			pluginName,
			options: {
				printf: true,
				colorize: true,
				timestamp: {
					format: 'DATE_ONLY',
				},
				...options.format,
			},
		}),
		transports,
		exitOnError: true,
		silent: false,
	};

	return createLogger(loggerOptions);
};
