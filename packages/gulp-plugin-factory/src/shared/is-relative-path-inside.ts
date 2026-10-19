import path from 'node:path';

/**
 * For option schemas: a relative path that stays inside the folder it is relative to, and is not that folder.
 * `css/main.css` passes; `/tmp/x`, `../x` and `.` do not.
 */
export const isRelativePathInside = (value: string): boolean => {
  const normalized = path.normalize(value).replace(/[\\/]+$/, '') || '.';

  return (
    !path.isAbsolute(value) && normalized !== '.' && normalized !== '..' && !normalized.startsWith(`..${path.sep}`)
  );
};
