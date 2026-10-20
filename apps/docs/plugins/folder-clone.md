---
description: Copy every file of a gulp stream into one or more extra folders in a single pass, with a hook to change, replace or skip each copy.
---

# folder-clone

Copies every file of the stream into one or more extra folders, relative to `file.base`, so a single `dest` writes them all. The originals are kept unless you turn them off, and a hook can change, replace or skip each copy. It replaces gulp-clone and the second `dest` that goes with it.

```sh
npm install --save-dev @zilero/gulp-folder-clone
```

## Usage

```ts
import { folderClone } from '@zilero/gulp-folder-clone';
import { dest, src } from 'gulp';
import { pipeline } from 'node:stream/promises';

// dist/images/logo.png, dist/backup/images/logo.png and dist/v2/images/logo.png
export const images = (): Promise<void> =>
  pipeline(
    src('src/images/**', { base: 'src', encoding: false }),
    folderClone({ dirs: ['backup', 'v2'] }),
    dest('dist')
  );
```

`onClone` runs for every copy:

```ts
folderClone({
  dirs: ['legacy', 'drafts'],
  onClone: ({ file, dir, original }) => {
    if (dir === 'drafts') {
      return null; // skip this copy
    }

    file.stem = `${file.stem}-${dir}`; // change it in place
  }
});
```

## Options

| Option         | Type                                                                                   | Default | Description                                                                                       |
| -------------- | -------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `dirs`         | `string \| string[]`                                                                   | —       | One or more folders inside `file.base` that receive a copy of every file. Required.               |
| `keepOriginal` | `boolean`                                                                              | `true`  | Emit the original file as well as the copies.                                                     |
| `onClone`      | `({ file, dir, original }) => Vinyl \| null \| void \| Promise<Vinyl \| null \| void>` | —       | Runs for every copy, may be async: change it in place, return another file, or `null` to skip it. |

`onClone` gets:

| Key        | Description                                             |
| ---------- | ------------------------------------------------------- |
| `file`     | The copy, already moved into `dir`; change it in place. |
| `dir`      | The folder this copy goes to, as given in `dirs`.       |
| `original` | The file the copy was made from.                        |

Return nothing to keep the copy, `null` to skip it, or another Vinyl file to emit instead. The source map of the emitted file is pointed at its path after the hook, so a copy the hook renames or moves keeps a correct map.

Each folder in `dirs` must be a relative path inside `file.base`: an absolute path, `'.'` (the base itself), a path that leaves the base such as `'../out'`, and an empty string are errors, and so is an empty `dirs` list (`Add at least one folder`). A folder listed twice, also written differently (`'backup'` and `'./backup/'`), is an error (`Each folder may be listed only once`): both copies would be written to the same path. Unknown keys are an error too. Options are checked when the plugin is created.

The package also exports the types `FolderCloneOptions`, `CloneHook` and `CloneInput`.

## Notes

- A copy keeps the original's `base` and gets the path `base/dir/relative`: `img/logo.png` with `dirs: 'backup'` becomes `backup/img/logo.png`.
- Copies are deep clones: each has its own contents and its own source map object, so changing a copy never touches the original or another copy.
- With `src(…, { sourcemaps: true })`, each copy's `sourceMap.file` points at the copy's relative path, after `onClone`; the original's map is left as it was.
- For each file the original comes first, then one copy per folder in the order of `dirs`. With `keepOriginal: false` and every copy skipped, nothing is emitted for that file.
- Every file is cloned, including files without contents (`read: false`) and directories.
- Read images and other binary files with `src(…, { encoding: false })`; gulp 5 reads files as UTF-8 by default.
- An error thrown by `onClone` is emitted as a `PluginError` with the file's path.

## Recipes

Mirror the build into `dist/latest`:

```ts
pipeline(src('dist/**', { encoding: false }), folderClone({ dirs: 'latest' }), dest('dist'));
```

Publish into two release folders, without the original:

```ts
folderClone({ dirs: ['releases/stable', 'releases/next'], keepOriginal: false });
```

Leave source maps out of one folder:

```ts
folderClone({
  dirs: 'public',
  onClone: ({ file }) => (file.extname === '.map' ? null : undefined)
});
```

## Migrating

### From gulp-clone

| gulp-clone                                                      | folder-clone                           |
| --------------------------------------------------------------- | -------------------------------------- |
| `clone()` / `clone.sink()`, a second branch with its own `dest` | `folderClone({ dirs })` and one `dest` |
| change the cloned files in the second branch                    | `onClone({ file, dir, original })`     |
| drop the originals by not writing the first branch              | `keepOriginal: false`                  |

### From 1.x

- 1.x only had an `onBeforeCopy(file)` hook and passed files through unchanged. 2.0 really copies each file into the folders in `dirs`.
- `keepOriginal` (default `true`) is new.
- `onBeforeCopy` is replaced by `onClone({ file, dir, original })`, which can change, replace or skip (`null`) each copy.

See [migrating from 1.x](/guide/migration) for every package.
