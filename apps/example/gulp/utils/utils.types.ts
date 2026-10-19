import type { Duplex } from 'node:stream';

export type WhenInput = {
  condition: boolean;
  /** Creates the step; called only when the condition holds. */
  then: () => Duplex;
};
