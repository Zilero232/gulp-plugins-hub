import chalk from 'chalk';

import { isError } from '@shared/helpers/typeHelpers';

import { createWinstonLogger } from './utils';

import type { GulpWinstonLoggerProps } from './types';
import { LOG_LEVELS } from './types';

/**
 * Logs an error message with a plugin name and optional options.
 *
 * @param {GulpWinstonLoggerProps} props
 * @param {string} props.pluginName - The name of the plugin (required).
 * @param {string} [props.message=""] - The message to log.
 * @param {GulpWinstonLoggerOptions} [props.options={}] - Options for winston logger.
 * @param {Error} [props.error] - The error to log.
 *
 * @throws {Error} If pluginName is not provided.
 * @throws {Error} If the type of Error passed is incorrect.
 * @throws {Error} If the message to log is empty.
 *
 * @example
 * GulpWinstonLogger({
 *   pluginName: "gulp-plugin-name",
 *   message: "Something went wrong",
 *   options: {
 *     level: "warn",
 *   },
 *   error: new Error("error message"),
 * });
 */

const GulpWinstonLogger = ({ pluginName, message = '', options = {}, error }: GulpWinstonLoggerProps) => {
	if (!pluginName) {
		throw new Error(`${chalk.green('GulpWinstonLogger')}: ${chalk.red('Missing PluginName')}`);
	}

	if (error && !isError(error)) {
		throw new Error(`${chalk.green('GulpWinstonLogger')}: ${chalk.red('The type of Error passed is incorrect')}`);
	}

	const logMessage = message || (error && isError(error) ? error.message : 'An error occurred');

	if (!logMessage) {
		throw new Error(`${chalk.green('GulpWinstonLogger')}: ${chalk.red('Missing Message')}`);
	}

	const logger = createWinstonLogger({ pluginName, options });

	if (error && error instanceof Error) {
		logger.error(logMessage, {
			level: (options.level as string) || LOG_LEVELS.error,
			message: logMessage || error.message,
			stack: error.stack || false,
		});
	} else {
		logger.log({
			level: (options.level as string) || LOG_LEVELS.error,
			message: logMessage,
		});
	}
};

export default GulpWinstonLogger;
