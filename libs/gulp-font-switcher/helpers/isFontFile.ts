import { isString } from '@shared/helpers/typeHelpers';

import { FontType } from '../types';

interface IsFontFileProps {
	extname: string;
}

/**
 * Checks if a file is a font file (based on its extension).
 *
 * @param {string} extname - The extension of the file.
 *
 * @returns {boolean} true if the file is a font file, false otherwise.
 */
const isFontFile = ({ extname }: IsFontFileProps) => {
	if (!extname || !isString(extname)) {
		return false;
	}

	return Object.values(FontType).includes(extname.toLowerCase() as FontType);
};

export default isFontFile;
