import type { BufferFile, PluginStream } from '@zilero/gulp-plugin-factory';

import { createPathMatcher, createPlugin, parseOptions, Vinyl } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { AssetRevisionOptions } from './asset-revision.schema';

import { DEFAULT_MANIFEST_PATH, PLUGIN_NAME } from './asset-revision.constants';
import { assetRevisionOptionsSchema } from './asset-revision.schema';
import { reviseFiles } from './revision';

/**
 * Cache-busting: renames assets after a hash of their contents (`main.css` → `main-3f2a9c1b7d.css`), rewrites
 * the references to them in HTML, CSS, JavaScript and other text files, and can emit a manifest. Pages and source
 * maps keep their names. The files are held until the stream ends, so pass the whole site through it at once.
 *
 * @example
 * src('build/**', { encoding: false })
 *   .pipe(assetRevision({ manifest: true }))
 *   .pipe(dest('dist'));
 */
export const assetRevision = (options: AssetRevisionOptions = {}): PluginStream => {
  const { hashLength, exclude, rewrite, manifest } = parseOptions({
    name: PLUGIN_NAME,
    schema: assetRevisionOptionsSchema,
    options
  });

  const isExcluded = createPathMatcher({ patterns: exclude, ignoreCase: true });
  const isRewritable = (file: BufferFile): boolean => rewrite !== false && rewrite.includes(file.extname.toLowerCase());
  const files: BufferFile[] = [];

  return createPlugin({
    name: PLUGIN_NAME,
    transform: (file) => {
      files.push(file);

      return null;
    },
    flush: ({ push }) => {
      const [first] = files;

      if (!first) {
        return;
      }

      const revised = reviseFiles({ files, hashLength, isExcluded, isRewritable });

      for (const file of revised.files) {
        push(file);
      }

      if (manifest) {
        push(
          new Vinyl({
            cwd: first.cwd,
            base: first.base,
            path: path.join(first.base, manifest === true ? DEFAULT_MANIFEST_PATH : manifest.path),
            contents: Buffer.from(`${JSON.stringify(revised.manifest, null, 2)}\n`)
          })
        );
      }
    }
  });
};
