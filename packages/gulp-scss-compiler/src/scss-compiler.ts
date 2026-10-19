import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { applySourceMap, createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import { pathToFileURL } from 'node:url';

import type { ScssCompilerOptions } from './scss-compiler.schema';

import { createCompilerHandle } from './compiler';
import { toSassError } from './errors';
import { PLUGIN_NAME } from './scss-compiler.constants';
import { scssCompilerOptionsSchema } from './scss-compiler.schema';
import { getSyntax } from './syntax';

/**
 * Compiles SCSS and indented Sass (`.scss`, `.sass`) to `.css` with the modern Sass compiler, from the file
 * contents. One compiler process serves the whole stream and stops when it ends. Partials are dropped, and the
 * file gets a source map when it had one (`src(…, { sourcemaps: true })`).
 *
 * @example
 * src('src/styles/**\/*.scss', { sourcemaps: true })
 *   .pipe(scssCompiler({ sassOptions: { style: 'compressed' } }))
 *   .pipe(dest('dist/css', { sourcemaps: '.' }));
 */
export const scssCompiler = (options: ScssCompilerOptions = {}): PluginStream => {
  const {
    sassOptions = {},
    skipPartials,
    onBeforeCompile,
    onAfterCompile
  } = parseOptions({
    name: PLUGIN_NAME,
    schema: scssCompilerOptionsSchema,
    options
  });
  const compiler = createCompilerHandle();

  const plugin = createPlugin({
    name: PLUGIN_NAME,
    filter: (file) => getSyntax(file.extname) !== undefined,
    transform: async (file) => {
      const syntax = getSyntax(file.extname);

      // Narrows the syntax; the filter already let only Sass files through.
      if (!syntax) {
        return;
      }

      if (skipPartials && file.stem.startsWith('_')) {
        return null;
      }

      let content = file.contents.toString();

      if (onBeforeCompile) {
        content = await onBeforeCompile({ content, file });
      }

      const sass = await compiler.acquire();
      const result = await sass
        .compileStringAsync(content, {
          ...sassOptions,
          loadPaths: [...(sassOptions.loadPaths ?? []), file.base],
          url: pathToFileURL(file.path),
          syntax,
          sourceMap: Boolean(file.sourceMap),
          sourceMapIncludeSources: true
        })
        .catch((error: unknown) => {
          throw toSassError({ error, filePath: file.path });
        });

      content = result.css;
      file.extname = '.css';

      if (onAfterCompile) {
        content = await onAfterCompile({ content, file });
      }

      file.contents = Buffer.from(content);

      if (file.sourceMap && result.sourceMap) {
        applySourceMap({ file, map: result.sourceMap });
      }
    },
    flush: compiler.dispose
  });

  // A stream destroyed by an error gets no flush: the compiler must not outlive it.
  plugin.once('close', () => void compiler.dispose());

  return plugin;
};
