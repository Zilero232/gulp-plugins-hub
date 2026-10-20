import type { BranchHandler } from '../../conditional.types';

export type CreateBranchStreamInput = {
  handler: BranchHandler;
  /** The option the handler came from (`handlers[0].handler`, `defaultHandler`), for errors. */
  name: string;
};
