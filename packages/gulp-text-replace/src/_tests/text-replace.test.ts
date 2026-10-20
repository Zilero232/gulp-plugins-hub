import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it } from 'vitest';

import textReplace from '..';

const replace = async (options: Parameters<typeof textReplace>[0], contents: string | Buffer = 'a.b a.b $1') => {
  const [output] = await runPlugin(textReplace(options), [createFile({ path: 'js/app.js', contents })]);

  return getContents(output).toString();
};

describe('textReplace', () => {
  it('replaces every occurrence of a string, literally', async () => {
    expect(await replace({ rules: { search: 'a.b', replace: '$&-x' } })).toBe('$&-x $&-x $1');
  });

  it('follows JavaScript for regular expressions: one match, or every match with g', async () => {
    expect(await replace({ rules: { search: /a\.(b)/, replace: '[$1]' } })).toBe('[b] a.b $1');
    expect(await replace({ rules: { search: /a\.(?<letter>b)/g, replace: '[$<letter>]' } })).toBe('[b] [b] $1');
  });

  it('applies rules in order', async () => {
    const rules = [
      { search: 'a', replace: 'b' },
      { search: 'b', replace: 'c' }
    ];

    expect(await replace({ rules }, 'ab')).toBe('cc');
  });

  it('calls async replacers with the match, groups, offset and file', async () => {
    const seen: unknown[] = [];

    const output = await replace({
      rules: {
        search: /(?<name>\w)\.(\w)/g,
        replace: async ({ match, groups, namedGroups, offset, file }) => {
          seen.push({ match, groups, namedGroups, offset });

          return `${file.stem}:${groups[1]}`;
        }
      }
    });

    expect(output).toBe('app:b app:b $1');
    expect(seen[1]).toEqual({ match: 'a.b', groups: ['a', 'b'], namedGroups: { name: 'a' }, offset: 4 });
  });

  it('calls replacers for string searches and a non-global RegExp', async () => {
    expect(await replace({ rules: { search: 'a.b', replace: ({ offset }) => String(offset) } })).toBe('0 4 $1');
    expect(await replace({ rules: { search: /a/, replace: () => 'X' } })).toBe('X.b a.b $1');
    expect(await replace({ rules: { search: /zzz/, replace: () => 'X' } })).toBe('a.b a.b $1');
  });

  it('adds a header and a footer, as text or the result of a function', async () => {
    expect(
      await replace({ header: '/* banner */\n', footer: async ({ file }) => `\n// ${getRelativePath(file)}` }, 'x')
    ).toBe('/* banner */\nx\n// js/app.js');
  });

  it('converts what a replacer returns to a string, like String.prototype.replace', async () => {
    // @ts-expect-error: JavaScript replacers may return numbers or null
    expect(await replace({ rules: { search: /\d/g, replace: ({ match }) => Number(match) * 2 } }, 'a1 b4')).toBe(
      'a2 b8'
    );

    // @ts-expect-error: JavaScript replacers may return null
    expect(await replace({ rules: { search: 'x', replace: () => null } }, 'x')).toBe('null');
    expect(await replace({ rules: { search: 'x', replace: () => '' } }, 'axb')).toBe('ab');
  });

  it('emits an error when a replacer returns undefined', async () => {
    // @ts-expect-error: a replacer that forgot to return
    const run = replace({ rules: { search: /a/, replace: () => {} } });

    await expect(run).rejects.toThrow('The replacer for /a/ returned undefined; return the replacement text');
  });

  it('emits an error when a header function returns something other than a string', async () => {
    // @ts-expect-error: a header that forgot to return
    await expect(replace({ header: () => {} })).rejects.toThrow(
      'header must return the text as a string, got undefined'
    );
  });

  it('adds the header after a byte order mark', async () => {
    expect(await replace({ header: '/* h */\n', footer: '\n// f' }, '\uFEFFx')).toBe('\uFEFF/* h */\nx\n// f');
  });

  it('starts a sticky or global RegExp from the beginning in every file', async () => {
    const rules = { search: /a/y, replace: 'X' };

    const output = await runPlugin(textReplace({ rules }), [
      createFile({ contents: 'aaa' }),
      createFile({ contents: 'aaa' })
    ]);

    expect(output.map((file) => getContents(file).toString())).toEqual(['Xaa', 'Xaa']);
  });

  it('fills in $ patterns like String.prototype.replace', async () => {
    const rules = { search: /(?<word>b)(c)?/g, replace: "[$&|$1|$2|$<word>|$$|$'|$`|$9]" };

    expect(await replace({ rules }, 'abd')).toBe('a[b|b||b|$|d|a|$9]d');
  });

  it('replaces empty matches', async () => {
    expect(await replace({ rules: { search: /^/gm, replace: '> ' } }, 'a\nb')).toBe('> a\n> b');
  });

  it('keeps the source map pointing at the original text', async () => {
    const file = createFile({ path: 'js/app.js', contents: 'const x = 1;\nlog(x);', sourceMap: true });

    const [output] = await runPlugin(
      textReplace({ rules: { search: 'log', replace: 'console.log' }, header: '// h\n' }),
      [file]
    );

    expect(getContents(output).toString()).toBe('// h\nconst x = 1;\nconsole.log(x);');
    expect(output!.sourceMap).toMatchObject({ file: 'js/app.js', sources: ['js/app.js'] });
    // `x` in `console.log(x)` (line 3, column 12) comes from `x` in `log(x)` (line 2, column 4).
    const position = originalPositionFor(new TraceMap(output!.sourceMap), { line: 3, column: 12 });

    expect(position).toMatchObject({ source: 'js/app.js', line: 2, column: 4 });
  });

  it('keeps the original text in the map when it is the first step', async () => {
    const file = createFile({ path: 'a.js', contents: 'log(1);', sourceMap: true });
    const [output] = await runPlugin(textReplace({ rules: { search: 'log', replace: 'console.log' } }), [file]);

    expect(output!.sourceMap.sourcesContent).toEqual(['log(1);']);
  });

  it('leaves binary files alone unless skipBinary is false', async () => {
    const binary = Buffer.from([0x61, 0x00, 0x61]);

    expect(await replace({ rules: { search: 'a', replace: 'b' } }, binary)).toBe('a\0a');
    expect(await replace({ rules: { search: 'a', replace: 'b' }, skipBinary: false }, binary)).toBe('b\0b');
  });

  it('rejects options that change nothing', () => {
    expect(() => textReplace({})).toThrow('Set at least one of rules, header or footer');
    expect(() => textReplace({ rules: [] })).toThrow('Add at least one rule');
    expect(() => textReplace({ rules: { search: '', replace: 'x' } })).toThrow('Expected the text to search for');
  });
});
