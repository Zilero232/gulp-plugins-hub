import { isFunction, isObjectType } from 'remeda';

import type { BranchStream } from '../conditional.types';

/**
 * Whether a value can be a branch: a writable and readable stream. Checked by shape, since plugins built on
 * `readable-stream` or `through2` are not instances of Node's own stream classes.
 */
export const isBranchStream = (value: unknown): value is BranchStream =>
  isObjectType(value) &&
  'write' in value &&
  isFunction(value.write) &&
  'pipe' in value &&
  isFunction(value.pipe) &&
  'on' in value &&
  isFunction(value.on);
