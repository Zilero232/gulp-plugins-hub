import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { isPartial } from '..';

describe('isPartial', () => {
  it('is true for a name or a folder starting with _', () => {
    expect(isPartial('_layout.pug')).toBe(true);
    expect(isPartial(path.join('templates', '_mixins.pug'))).toBe(true);
    expect(isPartial(path.join('_includes', 'nav.pug'))).toBe(true);
    expect(isPartial(path.join('pages', '_shared', 'blog', 'card.pug'))).toBe(true);
  });

  it('is false for other files', () => {
    expect(isPartial('index.pug')).toBe(false);
    expect(isPartial(path.join('pages', 'my_page.pug'))).toBe(false);
  });
});
