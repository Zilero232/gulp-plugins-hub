import type { transports } from 'winston';

import type { LogLevelKeys } from './logger';

// Interface for ConsoleTransport options.
export interface ConsoleTransportOptions extends transports.ConsoleTransportOptions {
	level?: LogLevelKeys; // Logging level for the console transport.
}

// Interface for FileTransport options.
export interface FileTransportOptions extends transports.FileTransportOptions {
	level?: LogLevelKeys; // Logging level for the file transport.
}

// Interface for HttpTransport options.
export interface HttpTransportOptions extends transports.HttpTransportOptions {
	level?: LogLevelKeys; // Logging level for the HTTP transport.
}

// Interface for StreamTransport options.
export interface StreamTransportOptions extends transports.StreamTransportOptions {
	level?: LogLevelKeys; // Logging level for the stream transport.
}

// General type for all transport options.
export interface TransportsOptions {
	console?: boolean | ConsoleTransportOptions; // Options for ConsoleTransport.
	file?: boolean | FileTransportOptions; // Options for FileTransport.
	http?: boolean | HttpTransportOptions; // Options for HttpTransport.
	stream?: boolean | StreamTransportOptions; // Options for StreamTransport.
}
