import type { Transform } from 'node:stream';

// Defining the type for the options PluginFactory.
export interface PluginFactoryOptions {
	pluginName: string;
	supportsDirectories?: boolean;
	supportsAnyType?: boolean;
	onFile: OnFile;
	onFinish?: OnFinish;
}

// Defining the type for the onFile function to be passed.
export type OnFile = (file: FileVinyl, encoding: BufferEncoding, stream: TransformStream) => unknown;

// Defining the type for the OnFinish function to be passed.
export type OnFinish = (stream: TransformStream) => unknown;

// Defining the type for the transformation function.
export type Transformer = (file: FileVinyl, encoding: BufferEncoding, stream: TransformStream) => Promise<FileVinyl | void>;

// Defining the type for the thread termination function.
export type Flusher = (stream: TransformStream) => Promise<void> | void;

// Define TransformStream as Transform - node:stream.
export type TransformStream = Transform;
