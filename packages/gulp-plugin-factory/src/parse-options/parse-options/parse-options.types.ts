import type { StandardSchemaV1 } from '@standard-schema/spec';

export type ParseOptionsInput<Schema extends StandardSchemaV1> = {
  /** Prefixes the error, like every other error of the plugin. */
  name: string;
  /** Any synchronous Standard Schema: zod 4, valibot, arktype, … */
  schema: Schema;
  options: unknown;
};
