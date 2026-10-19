import type { Duplex } from 'node:stream';

import { createPlugin, PluginError } from '@zilero/gulp-plugin-factory';
import { createFile, runPlugin } from '@zilero/gulp-plugin-factory/testing';
import { describe, expect, it, vi } from 'vitest';

import conditional from '..';

const tag = (label: string) => () =>
  createPlugin({
    name: `tag-${label}`,
    transform: (file) => {
      file.contents = Buffer.from(`${label}:${file.contents.toString()}`);
    }
  });

const files = () => [
  createFile({ path: 'a.js', contents: 'a' }),
  createFile({ path: 'b.css', contents: 'b' }),
  createFile({ path: 'c.txt', contents: 'c' })
];

const contents = async (stream: ReturnType<typeof conditional>) =>
  (await runPlugin(stream, files())).map((file) => String(file.contents)).sort();

describe('conditional', () => {
  it('sends each file through the first branch whose condition holds for it', async () => {
    const stream = conditional({
      handlers: [
        { condition: ({ file }) => file.extname === '.js', handler: tag('js') },
        { condition: ({ file }) => file.extname !== '.txt', handler: tag('not-txt') }
      ]
    });

    expect(await contents(stream)).toEqual(['c', 'js:a', 'not-txt:b']);
  });

  it('sends unmatched files to the default handler', async () => {
    const stream = conditional({
      handlers: [{ condition: async ({ file }) => file.extname === '.js', handler: tag('js') }],
      defaultHandler: tag('other')
    });

    expect(await contents(stream)).toEqual(['js:a', 'other:b', 'other:c']);
  });

  it('sends files through every plugin of an array, in order', async () => {
    const stream = conditional({
      handlers: [{ condition: ({ file }) => file.extname === '.js', handler: () => [tag('a')(), tag('b')()] }]
    });

    expect(await contents(stream)).toEqual(['b', 'b:a:a', 'c']);
  });

  it('emits an error from the middle of a chain', async () => {
    const failing = () =>
      createPlugin({
        name: 'failing',
        transform: () => {
          throw new Error('middle failed');
        }
      });

    const stream = conditional({ handlers: [{ condition: true, handler: () => [tag('a')(), failing(), tag('c')()] }] });

    await expect(runPlugin(stream, files())).rejects.toMatchObject({ plugin: 'failing', message: 'middle failed' });
  });

  it('emits an error for a handler that returns an empty array', async () => {
    const stream = conditional({ handlers: [{ condition: true, handler: () => [] }] });

    await expect(runPlugin(stream, files())).rejects.toThrow('A handler returned an empty array');
  });

  it('fails instead of hanging when a branch fails while a condition is awaited', async () => {
    const branchFailed = Promise.withResolvers<void>();

    // The error event comes on the next tick; setImmediate runs after it, so the condition below resumes once
    // the branch has failed, whatever the machine's load.
    const failsOnFirstFile = () =>
      createPlugin({
        name: 'fails-later',
        transform: () => {
          setImmediate(() => branchFailed.resolve());
          throw new Error('branch failed later');
        }
      });

    const stream = conditional({
      handlers: [
        {
          condition: async ({ file }) => {
            if (file.stem !== 'a') {
              await branchFailed.promise;
            }

            return true;
          },
          handler: failsOnFirstFile
        }
      ]
    });

    await expect(runPlugin(stream, files())).rejects.toMatchObject({ message: 'branch failed later' });
  });

  it('destroys its branches when it fails', async () => {
    const opened: Duplex[] = [];
    const tracked = () => {
      const branch = tag('t')();
      opened.push(branch);
      return branch;
    };

    const stream = conditional({
      handlers: [
        {
          condition: ({ file }) => {
            if (file.stem === 'b') {
              throw new Error('bad condition');
            }

            return true;
          },
          handler: tracked
        }
      ]
    });

    await expect(runPlugin(stream, files())).rejects.toThrow('bad condition');
    expect(opened.map((branch) => branch.destroyed)).toEqual([true]);
  });

  it('accepts boolean conditions', async () => {
    const stream = conditional({
      handlers: [
        { condition: false, handler: tag('never') },
        { condition: true, handler: tag('all') }
      ]
    });

    expect(await contents(stream)).toEqual(['all:a', 'all:b', 'all:c']);
  });

  it('creates each branch once, and only when a file goes to it', async () => {
    const used = vi.fn(tag('used'));
    const unused = vi.fn(tag('unused'));

    await contents(conditional({ handlers: [{ condition: true, handler: used }], defaultHandler: unused }));

    expect(used).toHaveBeenCalledOnce();
    expect(unused).not.toHaveBeenCalled();
  });

  it('waits for branches that emit files when they end', async () => {
    const collect = () =>
      createPlugin({
        name: 'collect',
        transform: () => null,
        flush: async ({ push }) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          push(createFile({ path: 'bundle.txt', contents: 'bundle' }));
        }
      });

    const stream = conditional({ handlers: [{ condition: ({ file }) => file.extname !== '.txt', handler: collect }] });

    expect(await contents(stream)).toEqual(['bundle', 'c']);
  });

  it('respects backpressure from a branch', async () => {
    const many = Array.from({ length: 100 }, (_, index) =>
      createFile({ path: `${index}.js`, contents: String(index) })
    );
    const stream = conditional({ handlers: [{ condition: true, handler: tag('x') }] });

    expect(await runPlugin(stream, many)).toHaveLength(100);
  });

  it('emits errors from a branch as PluginErrors', async () => {
    const failing = () =>
      createPlugin({
        name: 'failing',
        transform: () => {
          throw new Error('branch failed');
        }
      });

    const run = runPlugin(conditional({ handlers: [{ condition: true, handler: failing }] }), files());

    await expect(run).rejects.toBeInstanceOf(PluginError);
    await expect(run).rejects.toMatchObject({ plugin: 'failing', message: 'branch failed' });
  });

  it('emits an error when a condition throws', async () => {
    const stream = conditional({
      handlers: [
        {
          condition: () => {
            throw new Error('bad condition');
          },
          handler: tag('x')
        }
      ]
    });

    await expect(runPlugin(stream, files())).rejects.toMatchObject({ plugin: '@zilero/gulp-conditional' });
  });

  it('rejects options without handlers or with an invalid condition', () => {
    expect(() => conditional({ handlers: [] })).toThrow('Add at least one handler');
    // @ts-expect-error: a string is not a condition
    expect(() => conditional({ handlers: [{ condition: 'yes', handler: tag('x') }] })).toThrow(
      'Expected a boolean or a function'
    );
  });
});
