import { z } from 'zod';

export interface CreatePluginConfig<T extends z.ZodSchema> {
  name: string;
  schema: T;
  defaults?: z.infer<T>;
}

export interface ValidationError {
  message: string;
  path?: string[];
}
