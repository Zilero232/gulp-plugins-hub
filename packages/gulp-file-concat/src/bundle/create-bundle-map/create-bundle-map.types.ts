import type { Bundle } from 'magic-string';

import type { BundleSource } from '../bundle.types';

export type CreateBundleMapInput = {
  bundle: Bundle;
  sources: BundleSource[];
};
