import { z } from 'zod';
import { consola } from 'consola';
import chalk from 'chalk';

import { formatValidationErrors } from './helpers/formatValidationErrors';

import type { CreatePluginConfig } from './types';

/**
 * Create a function to validate plugin options.
 *
 * @example
 * ```ts
 * const validateOptions = createPluginOptions({
 *   name: 'MyPlugin',
 *   schema: mySchema,
 *   defaults: defaultOptions
 * });
 *
 * // Usage
 * const options = validateOptions({
 *   customOption: 'value'
 * });
 * ```
 */
export function createPluginOptions<T extends z.ZodSchema>({ name, schema, defaults }: CreatePluginConfig<T>) {
  return (options: z.infer<T>) => {
      try {
      // Merge with default options
      const mergedOptions = { ...defaults, ...options };

      return schema.parse(mergedOptions) as z.infer<T>;
    } catch (error) {
      if (error instanceof z.ZodError) {
        consola.box({
          title: chalk.red(`[${name} Error]`),
          message: error.errors.map(formatValidationErrors).join('\n\n'),
          style: {
            borderColor: 'red',
            borderStyle: 'round',
            padding: 1
          }
        });

        throw new Error();
      }

      throw error;
    }
  };
}
