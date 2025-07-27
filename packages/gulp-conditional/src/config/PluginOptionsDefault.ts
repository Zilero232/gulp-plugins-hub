import through2 from 'through2';

import type { GulpConditionalOptions } from '../schema';

const defaultOptions: GulpConditionalOptions = {
  handlers: [],
  defaultHandler: () => through2.obj(),
};

export default defaultOptions;
