import type FileVinylType from 'vinyl';
import type { Transform } from 'node:stream';

import { z } from 'zod';

// Base schema for FileVinyl
export const fileVinylSchema = z.custom<FileVinylType>();
export type FileVinyl = z.infer<typeof fileVinylSchema>;

// Base schema for TransformStream
export const transformStreamSchema = z.custom<Transform>((data) => {
  return data && typeof data === 'object' && 'pipe' in data && typeof data.pipe === 'function';
}, {
  message: 'Expected a valid Transform stream'
});
export type TransformStream = z.infer<typeof transformStreamSchema>;

