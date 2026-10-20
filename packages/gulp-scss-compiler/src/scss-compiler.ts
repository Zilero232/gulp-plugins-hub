import type { PluginStream } from '@zilero/gulp-plugin-factory';

import {
  applySourceMap,
  createPlugin,
  parseOptions,
  runContentHook,
  syncSourceMapFile
} from '@zilero/gulp-plugin-factory';
import { pathToFileURL } from 'node:url';

import type { ScssCompilerOptions } from './scss-compiler.schema';

import { createCompilerHandle } from './compiler';
import { toSassError } from './errors';
import { PLUGIN_NAME, SYNTAXES } from './scss-compiler.constants';
import { scssCompilerOptionsSchema } from './scss-compiler.schema';
import { getSyntax } from './syntax';

/**
 * Compiles SCSS and indented Sass (`.scss`, `.sass`) to `.css` with the modern Sass compiler, from the file
 * contents. One compiler process serves the whole stream and stops when it ends. Partials are dropped, and the
 * file gets a source map when it had one (`src(…, { sourcemaps: true })`), chained to that map.
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

  return createPlugin({
    name: PLUGIN_NAME,
    extensions: Object.keys(SYNTAXES),
    transform: async (file) => {
      const syntax = getSyntax(file.extname);

      // Narrows the syntax; `extensions` already let only Sass files through.
      if (!syntax) {
        return;
      }

      if (skipPartials && file.stem.startsWith('_')) {
        return null;
      }

      const source = await runContentHook({
        name: 'onBeforeCompile',
        hook: onBeforeCompile,
        content: file.contents.toString(),
        file
      });

      const sass = await compiler.acquire();

      const result = await sass
        .compileStringAsync(source, {
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

      // Before the rename: Sass takes no input map, so the file's own map is chained into the source that is it.
      if (file.sourceMap && result.sourceMap) {
        applySourceMap({ file, map: result.sourceMap, chain: true });
      }

      file.extname = '.css';

      syncSourceMapFile(file);

      const content = await runContentHook({ name: 'onAfterCompile', hook: onAfterCompile, content: result.css, file });

      file.contents = Buffer.from(content);
    },
    // Also runs when the stream is destroyed by an error, so the compiler never outlives it.
    dispose: compiler.dispose
  });
};
