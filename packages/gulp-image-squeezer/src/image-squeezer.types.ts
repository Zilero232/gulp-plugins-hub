import type { z } from 'zod';

import type { FORMAT_EXTENSIONS, OUTPUT_FORMATS } from './image-squeezer.constants';
import type { encoderOptionsSchema, qualitySchema } from './image-squeezer.schema';

/** An encoder sharp writes with. */
export type Encoder = keyof typeof FORMAT_EXTENSIONS;

/** What to write: `original` re-encodes in the source's own format. */
export type ImageFormat = (typeof OUTPUT_FORMATS)[number];

/** Quality from 1 to 100 for every lossy encoder, or per encoder. */
export type Quality = z.infer<typeof qualitySchema>;

/** sharp options per encoder, merged over the plugin's defaults. */
export type EncoderOptions = z.infer<typeof encoderOptionsSchema>;
