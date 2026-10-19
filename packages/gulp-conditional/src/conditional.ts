import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';

import type { ConditionalOptions } from './conditional.schema';

import { createBranchRegistry, findBranch, writeToBranch } from './branches';
import { DEFAULT_BRANCH, PLUGIN_NAME } from './conditional.constants';
import { conditionalOptionsSchema } from './conditional.schema';

/**
 * Sends each file through the first branch whose condition holds for it, like if / else if / else for streams.
 * Files no condition matches go to `defaultHandler`, or pass through untouched. Each branch stream is created
 * once, for its first file; the stream ends after every branch has finished.
 *
 * Branches run side by side, so files from different branches can come out in a different order.
 *
 * @example
 * src('src/**')
 *   .pipe(conditional({
 *     handlers: [
 *       { condition: ({ file }) => file.extname === '.js', handler: () => jsSqueezer() },
 *       { condition: ({ file }) => file.extname === '.scss', handler: () => [scssCompiler(), cssSqueezer()] }
 *     ]
 *   }))
 *   .pipe(dest('dist'));
 */
export const conditional = (options: ConditionalOptions): PluginStream => {
  const { handlers, defaultHandler } = parseOptions({ name: PLUGIN_NAME, schema: conditionalOptionsSchema, options });
  const conditions = handlers.map(({ condition }) => condition);
  const branches = createBranchRegistry();

  const plugin = createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    transform: async (file, { push }) => {
      branches.throwIfFailed();

      const index = await findBranch({ conditions, file });
      const handler = index === DEFAULT_BRANCH ? defaultHandler : handlers[index]?.handler;

      if (!handler) {
        return file;
      }

      // Again: a branch may have failed while the condition was awaited.
      branches.throwIfFailed();

      await writeToBranch({ branch: branches.open({ index, handler, push }), file });

      return null;
    },
    flush: async () => {
      branches.throwIfFailed();

      await branches.closeAll();
    }
  });

  // Ended or failed, the conditional takes its branches with it: a branch holding a process (a Sass compiler)
  // must not keep gulp alive. Destroying branches that already finished does nothing.
  plugin.once('close', () => branches.destroyAll());

  return plugin;
};
