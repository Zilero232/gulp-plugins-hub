import type { StandardSchemaV1 } from '@standard-schema/spec';

import PluginError from 'plugin-error';

import type { ParseOptionsInput } from './parse-options.types';

import { formatIssues } from './format-issues';

/**
 * Validates plugin options against a Standard Schema and returns the parsed value (defaults applied).
 * Invalid options throw a PluginError listing every issue: options are checked when the plugin is
 * created, outside the stream, where throwing is the gulp convention.
 */
export const parseOptions = <Schema extends StandardSchemaV1>({
  name,
  schema,
  options
}: ParseOptionsInput<Schema>): StandardSchemaV1.InferOutput<Schema> => {
  const result = schema['~standard'].validate(options);

  // Any thenable, not only native promises: schema libraries may return their own.
  if ('then' in result) {
    throw new PluginError(name, 'The options schema must be synchronous');
  }

  if (result.issues) {
    throw new PluginError(name, `Invalid options:\n${formatIssues(result.issues)}`);
  }

  return result.value;
};
