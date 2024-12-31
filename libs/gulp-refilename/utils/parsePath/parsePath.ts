import path from 'node:path';

import type { ParsedPath } from '../types';

export function parsePath(filePath: string, multiExt = false): ParsedPath {
	const extname = multiExt ? path.basename(filePath).slice(path.basename(filePath).indexOf('.')) : path.extname(filePath);

	return {
		dirname: path.dirname(filePath),
		basename: path.basename(filePath, extname),
		extname,
	};
}
