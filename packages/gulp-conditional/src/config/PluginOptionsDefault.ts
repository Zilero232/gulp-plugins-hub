import through2 from 'through2';

import type { GulpConditionalOptions } from '../types';

const defaultOptions: GulpConditionalOptions<ReturnType<typeof through2.obj>> = {
  handlers: [],
  defaultHandler: through2.obj(),
};

export default defaultOptions;
