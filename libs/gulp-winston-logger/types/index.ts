import type { GulpWinstonLoggerOptions } from './modules/logger';

export interface GulpWinstonLoggerProps {
	pluginName: string; // The name of the plugin (required).
	message?: string; // The message to log.
	options?: GulpWinstonLoggerOptions; // Options for winston logger.
	error?: Error; // The error to log.
}

export { ColorizeOptions } from './modules/colorize';
export { FormatOptions, GulpWinstonLoggerOptions, LOG_LEVELS, TimestampFormat } from './modules/logger';
export { ConsoleTransportOptions, FileTransportOptions, HttpTransportOptions, StreamTransportOptions, TransportsOptions } from './modules/transports';
