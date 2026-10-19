import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions, toPosixPath } from '@zilero/gulp-plugin-factory';
import { compile } from 'pug';

import type { PugCompilerOptions } from './pug-compiler.schema';

import { PLUGIN_NAME, PUG_EXTENSIONS } from './pug-compiler.constants';
import { pugCompilerOptionsSchema } from './pug-compiler.schema';

/**
 * Renders Pug templates (`.pug`, `.jade`) to HTML from the file contents, so earlier plugins can change them.
 * Includes and `extends` resolve from the file's own path; partials (`_layout.pug`) are dropped.
 *
 * @example
 * src('src/pages/**\/*.pug')
 *   .pipe(pugCompiler({ data: ({ file }) => ({ page: file.stem, year: 2026 }), pugOptions: { pretty: true } }))
 *   .pipe(dest('dist'));
 */
export const pugCompiler = (options: PugCompilerOptions = {}): PluginStream => {
  const { pugOptions, data, extname, skipPartials, onBeforeCompile, onAfterCompile } = parseOptions({
    name: PLUGIN_NAME,
    schema: pugCompilerOptionsSchema,
    options
  });

  return createPlugin({
    name: PLUGIN_NAME,
    filter: (file) => PUG_EXTENSIONS.includes(file.extname.toLowerCase()),
    transform: async (file) => {
      if (skipPartials && file.stem.startsWith('_')) {
        return null;
      }

      let content = file.contents.toString();

      if (onBeforeCompile) {
        content = await onBeforeCompile({ content, file });
      }

      // compileDebug keeps the source in the template, so runtime errors quote the compiled text, not the file on disk.
      const template = compile(content, { basedir: file.base, compileDebug: true, ...pugOptions, filename: file.path });
      const locals = typeof data === 'function' ? await data({ file }) : data;

      content = template(locals);
      file.extname = extname;

      if (file.sourceMap) {
        file.sourceMap.file = toPosixPath(file.relative);
      }

      if (onAfterCompile) {
        content = await onAfterCompile({ content, file });
      }

      file.contents = Buffer.from(content);
    }
  });
};
