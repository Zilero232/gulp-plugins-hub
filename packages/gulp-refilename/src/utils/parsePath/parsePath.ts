import path from 'node:path';

export function parsePath(filePath: string, multiExt = false) {
	const extname = multiExt ? path.basename(filePath).slice(path.basename(filePath).indexOf('.')) : path.extname(filePath);

	return {
		dirname: path.dirname(filePath),
		basename: path.basename(filePath, extname),
		extname,
	};
}
