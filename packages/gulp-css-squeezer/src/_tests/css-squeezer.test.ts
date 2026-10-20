import { PluginError } from '@zilero/gulp-plugin-factory';
import { createFile, getContents, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import cssSqueezer from '..';

const SOURCE = `.card {
  display: flex;
  user-select: none;
  color: #ff0000;

  & .title { margin: 0px 0px 0px 0px; }
}
`;

const squeeze = async (
  options?: Parameters<typeof cssSqueezer>[0],
  file = createFile({ path: 'css/main.css', contents: SOURCE })
) => {
  const [output] = await runPlugin(cssSqueezer(options), [file]);

  return output;
};

describe('cssSqueezer', () => {
  it('minifies, lowers nesting and prefixes for old targets', async () => {
    const css = getContents(await squeeze({ targets: 'safari 10' })).toString();

    expect(css).toBe('.card{-webkit-user-select:none;user-select:none;color:red;display:flex}.card .title{margin:0}');
  });

  it('keeps modern syntax for modern targets', async () => {
    const css = getContents(await squeeze({ targets: ['chrome 130', 'firefox 130'] })).toString();

    expect(css).toContain('&');
    expect(css).not.toContain('-webkit-user-select');
  });

  it('only transforms without minify', async () => {
    const css = getContents(await squeeze({ targets: 'safari 10', minify: false })).toString();

    expect(css).toContain('\n');
    expect(css).toContain('-webkit-user-select: none');
  });

  describe('with a browserslist config next to the file', () => {
    let base: string;

    beforeAll(async () => {
      base = await realpath(await mkdtemp(path.join(tmpdir(), 'css-squeezer-')));
      await writeFile(path.join(base, '.browserslistrc'), 'safari 10\n');
    });

    afterAll(() => rm(base, { recursive: true, force: true }));

    it('reads the targets from it', async () => {
      const file = createFile({ cwd: base, base, path: 'main.css', contents: SOURCE });

      expect(getContents(await squeeze({}, file)).toString()).toContain('-webkit-user-select');
    });
  });

  it('passes Lightning CSS options and runs the hooks', async () => {
    const output = await squeeze({
      targets: 'chrome 130',
      lightningcssOptions: { errorRecovery: true },
      onBeforeMinify: ({ content }) => `${content}\n.broken { color: ; }\n`,
      onAfterMinify: ({ content, file }) => `/* ${file.basename} */${content}`
    });

    expect(getContents(output).toString()).toMatch(/^\/\* main\.css \*\/\.card\{/);
  });

  it('reports Lightning CSS warnings to onWarning', async () => {
    const warnings: unknown[] = [];

    await squeeze(
      {
        targets: 'chrome 130',
        lightningcssOptions: { errorRecovery: true },
        onWarning: ({ file, ...warning }) => {
          warnings.push({ ...warning, path: getRelativePath(file) });
        }
      },
      createFile({ path: 'css/main.css', contents: '.a { color: red; }\n@foo bar;\n' })
    );

    expect(warnings).toEqual([
      { type: 'AtRuleInvalid', message: 'Unknown at rule: @foo', line: 2, column: 5, path: 'css/main.css' }
    ]);
  });

  it('processes extensions in any case', async () => {
    const output = await squeeze(
      { targets: 'chrome 130' },
      createFile({ path: 'MAIN.CSS', contents: '.a { color: #ff0000; }' })
    );

    expect(getContents(output).toString()).toBe('.a{color:red}');
  });

  it('emits a PluginError naming the hook that returns no text', async () => {
    // @ts-expect-error: a JavaScript hook that forgets to return
    const run = squeeze({ onBeforeMinify: () => {} });

    await expect(run).rejects.toThrow('onBeforeMinify must return the text as a string, got undefined');
  });

  it('adds a source map when the file has one', async () => {
    const output = await squeeze({}, createFile({ path: 'css/main.css', contents: SOURCE, sourceMap: true }));

    expect(output!.sourceMap).toMatchObject({ file: 'css/main.css', sources: ['css/main.css'] });
    expect(output!.sourceMap.mappings).not.toBe('');
  });

  it('chains the map from an earlier step without an extra source', async () => {
    const file = createFile({ path: 'css/main.css', contents: '.a{color:red}' });

    file.sourceMap = {
      version: 3,
      sources: ['scss/main.scss'],
      names: [],
      mappings: 'AAAA',
      sourcesContent: ['.a { color: red; }']
    };

    const output = await squeeze({ targets: 'chrome 130' }, file);

    expect(output!.sourceMap.sources).toEqual(['scss/main.scss']);
  });

  it('rejects an invalid browserslist query when created', () => {
    expect(() => cssSqueezer({ targets: 'no such browser 99' })).toThrow(/Invalid targets: Unknown browser query/);
  });

  it('leaves other files alone', async () => {
    const scss = createFile({ path: 'a.scss', contents: '$a: 1;' });

    expect(getContents(await squeeze({}, scss)).toString()).toBe('$a: 1;');
  });

  it('emits a PluginError for invalid CSS, with its line', async () => {
    const broken = createFile({ path: 'broken.css', contents: '.a{}\n.b { color: red;\n}}}' });
    const run = squeeze({}, broken);

    await expect(run).rejects.toBeInstanceOf(PluginError);
    await expect(run).rejects.toMatchObject({ lineNumber: 3, message: 'Unexpected end of input (line 3, column 4)' });
  });
});
