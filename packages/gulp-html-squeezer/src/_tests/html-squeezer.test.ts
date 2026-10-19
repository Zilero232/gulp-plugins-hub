import { createFile, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import htmlSqueezer from '..';

const PAGE = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html>
  <head>
    <!-- a comment -->
    <style>  body  { color :  red ; }  </style>
  </head>
  <body>
    <p   class="intro" >  Hello,   world  </p>
    <input type="text" disabled="disabled">
  </body>
</html>
`;

const squeeze = async (options?: Parameters<typeof htmlSqueezer>[0], path = 'index.html') => {
  const [output] = await runPlugin(htmlSqueezer(options), [createFile({ path, contents: PAGE })]);
  return String(output!.contents);
};

describe('htmlSqueezer', () => {
  it('uses the conservative preset by default', async () => {
    const html = await squeeze();

    expect(html).not.toContain('<!-- a comment -->');
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<input type="text" disabled>');
    expect(html).toContain('body  { color :  red ; }');
  });

  it('minifies inline CSS with the comprehensive preset', async () => {
    const html = await squeeze({ preset: 'comprehensive' });

    expect(html).toContain('body{color:red}');
    expect(html).toContain('<p class=intro>Hello, world');
  });

  it('applies html-minifier-next options over the preset', async () => {
    const html = await squeeze({ preset: 'comprehensive', htmlMinifierOptions: { removeAttributeQuotes: false } });

    expect(html).toContain('class="intro"');
  });

  it('only applies the given options without a preset', async () => {
    const html = await squeeze({ preset: false, htmlMinifierOptions: { removeComments: true } });

    expect(html).not.toContain('a comment');
    expect(html).toContain('>  Hello,   world  </p>');
  });

  it('runs the hooks before and after minification', async () => {
    const html = await squeeze({
      onBeforeMinify: ({ content }) => content.replace('Hello', 'Hi'),
      onAfterMinify: async ({ content, file }) => `<!-- ${file.basename} -->\n${content}`
    });

    expect(html).toMatch(/^<!-- index\.html -->\n.*Hi,/s);
  });

  it('leaves files that are not HTML alone, XHTML included', async () => {
    expect(await squeeze({}, 'page.pug')).toBe(PAGE);
    expect(await squeeze({}, 'page.xhtml')).toBe(PAGE);
  });

  it('minifies uppercase extensions', async () => {
    expect(await squeeze({}, 'INDEX.HTML')).not.toContain('<!-- a comment -->');
  });

  it('rejects an unknown preset', () => {
    // @ts-expect-error: not a preset
    expect(() => htmlSqueezer({ preset: 'maximum' })).toThrow(/preset/);
  });
});
