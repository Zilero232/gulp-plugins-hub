// The examples of docs/guide/writing-plugins.md, so the guide cannot drift from the API.
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createPlugin } from '..';
import { parseOptions, toPosixPath, Vinyl } from '../..';
import { createFile, getContents, getRelativePath, runPlugin } from '../../testing';

const PLUGIN_NAME = 'gulp-banner';

const optionsSchema = z
  .object({ text: z.string().min(1), extensions: z.array(z.string()).default(['.js', '.css']) })
  .strict();

const banner = (options: z.input<typeof optionsSchema>) => {
  const { text, extensions } = parseOptions({ name: PLUGIN_NAME, schema: optionsSchema, options });

  return createPlugin({
    name: PLUGIN_NAME,
    filter: (file) => extensions.includes(file.extname),
    transform: (file) => {
      file.contents = Buffer.concat([Buffer.from(`${text}\n`), file.contents]);
    }
  });
};

const fileList = () => {
  const names: string[] = [];

  return createPlugin({
    name: 'gulp-file-list',
    transform: (file) => {
      names.push(toPosixPath(file.relative));
      return null;
    },
    flush: ({ push }) => push(new Vinyl({ path: path.resolve('files.txt'), contents: Buffer.from(names.join('\n')) }))
  });
};

describe('writing-plugins guide', () => {
  it('banner adds the banner to scripts only', async () => {
    const [script, image] = await runPlugin(banner({ text: '/*! hi */' }), [
      createFile({ path: 'app.js', contents: 'run();' }),
      createFile({ path: 'logo.png', contents: 'png' })
    ]);

    expect(getContents(script).toString()).toBe('/*! hi */\nrun();');
    expect(getContents(image).toString()).toBe('png');
  });

  it('banner rejects an empty text', () => {
    expect(() => banner({ text: '' })).toThrow(/Invalid options:\n {4}• text:/);
  });

  it('fileList emits one file listing the others, relative to the working directory', async () => {
    const [list] = await runPlugin(fileList(), [createFile({ path: 'a.js' }), createFile({ path: 'css/b.css' })]);

    expect(getRelativePath(list)).toBe('files.txt');
    expect(getContents(list).toString()).toBe('a.js\ncss/b.css');
  });
});
