import { isRelativePathInside } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import { DEFAULT_EXCLUDE, DEFAULT_MANIFEST_PATH, DEFAULT_REWRITE_EXTENSIONS } from './asset-revision.constants';

const extensionSchema = z
  .string()
  .regex(/^\.\w[\w.-]*$/, 'Expected an extension with its dot, like .css')
  .transform((extension) => extension.toLowerCase());

const manifestSchema = z
  .object({
    /** The manifest's path relative to the output folder. Default `rev-manifest.json`. */
    path: z
      .string()
      .refine(isRelativePathInside, 'Expected a path inside the output folder')
      .default(DEFAULT_MANIFEST_PATH)
  })
  .strict();

export const assetRevisionOptionsSchema = z
  .object({
    /** Characters of the SHA-256 hash added to names: `main-3f2a9c1b7d.css`. Default 10. */
    hashLength: z.number().int().min(4).max(64).default(10),
    /**
     * Globs of files that keep their names; their references are still rewritten. A glob without a slash matches
     * the file name in any directory; case does not matter. Replaces the default list (pages, source maps,
     * robots.txt, favicon.ico, sitemaps, service workers, web app manifests, `.well-known/**`, …). Files without
     * an extension keep their names whatever the list.
     */
    exclude: z.array(z.string().min(1, 'Expected a glob')).default(DEFAULT_EXCLUDE),
    /** Rewrite references in text files with these extensions, or `false` to only rename. */
    rewrite: z.union([z.literal(false), z.array(extensionSchema)]).default(DEFAULT_REWRITE_EXTENSIONS),
    /** Emit a JSON manifest of original to revised paths, for server-side templates. Default false. */
    manifest: z.union([z.boolean(), manifestSchema]).default(false)
  })
  .strict();

export type AssetRevisionOptions = z.input<typeof assetRevisionOptionsSchema>;
