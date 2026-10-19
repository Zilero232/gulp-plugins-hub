import type { TransformResult } from 'lightningcss';

import { PluginError } from '@zilero/gulp-plugin-factory';
import { transform } from 'lightningcss';

import type { TransformCssInput } from './transform.types';

import { PLUGIN_NAME } from '../css-squeezer.constants';

const hasLocation = (error: unknown): error is Error & { loc: { line: number; column: number } } =>
  error instanceof Error &&
  'loc' in error &&
  typeof error.loc === 'object' &&
  error.loc !== null &&
  'line' in error.loc &&
  typeof error.loc.line === 'number';

/** Runs Lightning CSS; a syntax error becomes a PluginError with the line and column it points at. */
export const transformCss = ({ options, filePath }: TransformCssInput): TransformResult => {
  try {
    return transform(options);
  } catch (error) {
    if (!hasLocation(error)) {
      throw error;
    }

    const { line, column } = error.loc;

    throw new PluginError(PLUGIN_NAME, `${error.message} (line ${line}, column ${column})`, {
      fileName: filePath,
      lineNumber: line,
      showProperties: false
    });
  }
};
