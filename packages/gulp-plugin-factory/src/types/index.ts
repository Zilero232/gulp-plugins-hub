import type { FileVinyl, TransformStream } from '@/shared/schemas';

// Defining the type for the transformation function.
export type Transformer = (file: FileVinyl, encoding: BufferEncoding, stream: TransformStream) => Promise<FileVinyl | void>;

// Defining the type for the thread termination function.
export type Flusher = (stream: TransformStream) => Promise<void>;
