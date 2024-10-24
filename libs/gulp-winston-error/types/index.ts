import { GulpWinstonErrorOptions } from "./modules/logger";

export interface GulpWinstonErrorProps {
  pluginName: string; // The name of the plugin (required).
  message?: string; // The message to log.
  options?: GulpWinstonErrorOptions; // Options for winston logger.
  error?: Error; // The error to log.
}

export { ColorizeOptions } from "./modules/colorize";
export { FormatOptions, GulpWinstonErrorOptions, LOG_LEVELS, TimestampFormat } from "./modules/logger";
export { ConsoleTransportOptions, FileTransportOptions, HttpTransportOptions, StreamTransportOptions, TransportsOptions } from "./modules/transports";
