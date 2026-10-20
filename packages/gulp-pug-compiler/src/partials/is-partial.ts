import { toPosixPath } from '@zilero/gulp-plugin-factory';

/**
 * Whether a path relative to the base is a partial: its name, or the name of a folder it is in, starts with `_`
 * (`_layout.pug`, `_includes/nav.pug`).
 */
export const isPartial = (relativePath: string): boolean =>
  toPosixPath(relativePath)
    .split('/')
    .some((segment) => segment.startsWith('_'));
