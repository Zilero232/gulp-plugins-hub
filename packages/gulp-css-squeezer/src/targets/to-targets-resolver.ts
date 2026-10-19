import { PluginError } from '@zilero/gulp-plugin-factory';

import type { TargetsResolver } from './targets.types';

import { PLUGIN_NAME } from '../css-squeezer.constants';
import { createTargetsResolver } from './create-targets-resolver';

/** The targets resolver, with an invalid browserslist query reported as the plugin's own options error. */
export const toTargetsResolver = (query: string | string[] | undefined): TargetsResolver => {
  try {
    return createTargetsResolver(query);
  } catch (error) {
    throw new PluginError(PLUGIN_NAME, `Invalid targets: ${error instanceof Error ? error.message : String(error)}`);
  }
};
