import { PluginError } from '@zilero/gulp-plugin-factory';
import { fileURLToPath } from 'node:url';
import { Exception } from 'sass-embedded';

import type { ToSassErrorInput } from './errors.types';

import { PLUGIN_NAME } from '../scss-compiler.constants';

/**
 * A Sass error as a PluginError that points at the stylesheet where it happened (a partial, often) and its line,
 * with Sass's own message and code excerpt, and without the raw span object in the details.
 */
export const toSassError = ({ error, filePath }: ToSassErrorInput): unknown => {
  if (!(error instanceof Exception)) {
    return error;
  }

  const { url, start } = error.span;

  return new PluginError(PLUGIN_NAME, error.message.replace(/^Error: /, ''), {
    fileName: url?.protocol === 'file:' ? fileURLToPath(url) : filePath,
    lineNumber: start.line + 1,
    showProperties: false
  });
};
