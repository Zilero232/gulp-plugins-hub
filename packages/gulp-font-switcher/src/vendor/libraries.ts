import { createRequire } from 'node:module';

import type { Fontverter, SubsetFont } from './vendor.types';

// Both are CommonJS without usable types: loaded with require, typed here, so the packages that typecheck this
// one's sources need no declaration files.
const require = createRequire(import.meta.url);

export const fontverter: Fontverter = require('fontverter');

export const subsetFont: SubsetFont = require('subset-font');
