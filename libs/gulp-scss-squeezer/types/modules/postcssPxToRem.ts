import type { Input } from 'postcss';

export interface PostCssPxToRemOptions {
	options?: {
		rootValue?: number | ((input: Input) => number);
		unitPrecision?: number;
		propList?: string[];
		selectorBlackList?: Array<string | RegExp>;
		replace?: boolean;
		mediaQuery?: boolean;
		minPixelValue?: number;
		exclude?: string | RegExp | ((file: string) => boolean);
		unit?: string;
	};
}
