import { describe, expect, it } from 'vitest';

import { planVariants } from '..';

describe('planVariants', () => {
  it('plans every format at every width, in order', () => {
    expect(planVariants({ formats: ['original', 'webp'], widths: [100, 200], sourceEncoder: 'jpeg' })).toEqual([
      { encoder: 'jpeg', original: true, width: 100 },
      { encoder: 'webp', original: false, width: 100 },
      { encoder: 'jpeg', original: true, width: 200 },
      { encoder: 'webp', original: false, width: 200 }
    ]);
  });

  it('keeps only original when the source format is asked for twice', () => {
    expect(planVariants({ formats: ['jpeg', 'original', 'avif'], widths: undefined, sourceEncoder: 'jpeg' })).toEqual([
      { encoder: 'jpeg', original: true, width: undefined },
      { encoder: 'avif', original: false, width: undefined }
    ]);
  });

  it('writes the source format as original when original is not asked for', () => {
    expect(planVariants({ formats: ['png'], widths: undefined, sourceEncoder: 'png' })).toEqual([
      { encoder: 'png', original: true, width: undefined }
    ]);
  });

  it('turns widths larger than the source into one at its own width', () => {
    expect(
      planVariants({ formats: ['webp'], widths: [300, 1280, 1920], sourceEncoder: 'jpeg', sourceWidth: 1000 })
    ).toEqual([
      { encoder: 'webp', original: false, width: 300 },
      { encoder: 'webp', original: false, width: 1000 }
    ]);
  });
});
