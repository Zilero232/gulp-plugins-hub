import { PluginError } from '@zilero/gulp-plugin-factory';
import { createFile, getRelativePath, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import path from 'node:path';
import { minify } from 'terser';
import { describe, expect, it } from 'vitest';

import jsSqueezer from '..';

const SOURCE =
  'function add(first, second) {\n  console.log("adding");\n  return first + second;\n}\nexport { add };\n';

const squeeze = async (
  options: Parameters<typeof jsSqueezer>[0],
  file = createFile({ path: 'js/app.js', contents: SOURCE })
) => {
  const [output] = await runPlugin(jsSqueezer(options), [file]);

  return output!;
};

describe('jsSqueezer', () => {
  it('minifies JavaScript with terser', async () => {
    const output = await squeeze({ terserOptions: { module: true } });

    expect(String(output.contents)).toMatch(
      /^function (\w)\((\w),(\w)\)\{return console\.log\("adding"\),\2\+\3\}export\{\1 as add\};$/
    );
  });

  it('passes terser options through', async () => {
    const output = await squeeze({ terserOptions: { module: true, compress: { drop_console: true } } });

    expect(String(output.contents)).not.toContain('console');
  });

  it('runs the hooks before and after terser', async () => {
    const output = await squeeze({
      onBeforeMinify: ({ content }) => content.replace('adding', 'summing'),
      onAfterMinify: async ({ content, file }) => `/* ${getRelativePath(file)} */${content}`
    });

    expect(String(output.contents)).toMatch(/^\/\* js\/app\.js \*\/.*summing/);
  });

  it('leaves files that are not JavaScript alone', async () => {
    const css = createFile({ path: 'a.css', contents: 'a  {  }' });

    expect(String((await squeeze({}, css)).contents)).toBe('a  {  }');
  });

  it('creates a source map when the file has one', async () => {
    const output = await squeeze({}, createFile({ path: 'js/app.js', contents: SOURCE, sourceMap: true }));

    expect(output.sourceMap).toMatchObject({
      version: 3,
      file: 'js/app.js',
      sources: ['js/app.js'],
      sourcesContent: [SOURCE]
    });

    expect(output.sourceMap.mappings).not.toBe('');
  });

  it('chains an existing source map to the original sources', async () => {
    const bundled = await minify(
      { 'src/add.js': SOURCE },
      { compress: false, mangle: false, sourceMap: { asObject: true, includeSources: true } }
    );

    const file = createFile({ path: 'js/app.js', contents: bundled.code! });

    file.sourceMap = bundled.map;

    const output = await squeeze({}, file);

    expect(output.sourceMap.sources).toEqual(['src/add.js']);
    expect(output.sourceMap.file).toBe('js/app.js');
  });

  it('minifies .mjs files as ES modules by default', async () => {
    const output = await squeeze({}, createFile({ path: 'js/app.mjs', contents: 'const unused = 1;\nexport {};\n' }));

    // Top-level declarations are local to a module, so the unused one goes.
    expect(String(output.contents)).toBe('export{};');
  });

  it('minifies .cjs and .js files as scripts by default', async () => {
    const contents = 'var unused = 1;\n';

    for (const name of ['app.cjs', 'app.js']) {
      const output = await squeeze({}, createFile({ path: name, contents }));

      expect(String(output.contents)).toBe('var unused=1;');
    }
  });

  it('lets terserOptions.module win over the extension', async () => {
    const output = await squeeze(
      { terserOptions: { module: false } },
      createFile({ path: 'app.mjs', contents: 'var unused = 1;\n' })
    );

    expect(String(output.contents)).toBe('var unused=1;');
  });

  it('minifies extensions in any case', async () => {
    const output = await squeeze({}, createFile({ path: 'APP.MJS', contents: 'const unused = 1;\nexport {};\n' }));

    expect(String(output.contents)).toBe('export{};');
  });

  it('emits a PluginError naming the hook that returns no text', async () => {
    // @ts-expect-error: a JavaScript hook that forgets to return
    const run = squeeze({ onAfterMinify: () => {} });

    await expect(run).rejects.toThrow('onAfterMinify must return the text as a string, got undefined');
  });

  it('emits a PluginError for invalid JavaScript', async () => {
    const run = squeeze({}, createFile({ path: 'broken.js', contents: 'function (' }));

    await expect(run).rejects.toBeInstanceOf(PluginError);

    await expect(run).rejects.toMatchObject({
      plugin: '@zilero/gulp-js-squeezer',
      fileName: path.join('/project', 'src', 'broken.js')
    });
  });
});
