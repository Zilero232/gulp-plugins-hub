import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions, runContentHook, syncSourceMapFile } from '@zilero/gulp-plugin-factory';
import { compile } from 'pug';

import type { PugCompilerOptions } from './pug-compiler.schema';

import { resolveLocals } from './locals';
import { isPartial } from './partials';
import { PLUGIN_NAME, PUG_EXTENSIONS } from './pug-compiler.constants';
import { pugCompilerOptionsSchema } from './pug-compiler.schema';

/**
 * Renders Pug templates (`.pug`, `.jade`) to HTML from the file contents, so earlier plugins can change them.
 * Includes and `extends` resolve from the file's own path; partials (`_layout.pug`, `_includes/nav.pug`) are
 * dropped. Templates get `file.data` (gulp-data, front matter) with the `data` option over it as locals.
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
    extensions: PUG_EXTENSIONS,
    transform: async (file) => {
      if (skipPartials && isPartial(file.relative)) {
        return null;
      }

      const source = await runContentHook({
        name: 'onBeforeCompile',
        hook: onBeforeCompile,
        content: file.contents.toString(),
        file
      });

      // compileDebug keeps the source in the template, so runtime errors quote the compiled text, not the file on disk.
      const template = compile(source, { basedir: file.base, compileDebug: true, ...pugOptions, filename: file.path });
      const html = template(await resolveLocals({ file, data }));

      file.extname = extname;

      syncSourceMapFile(file);

      const content = await runContentHook({ name: 'onAfterCompile', hook: onAfterCompile, content: html, file });

      file.contents = Buffer.from(content);
    }
  });
};
