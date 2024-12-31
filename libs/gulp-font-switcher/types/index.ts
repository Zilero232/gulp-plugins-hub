// Types for font formats.
export enum FontType {
	OTF = 'otf',
	TTF = 'ttf',
	WOFF = 'woff',
	WOFF2 = 'woff2',
	EOT = 'eot',
	SVG = 'svg',
}

// Values for FontType.
export type FontTypeValues = `${FontType}`;

// A type that prohibits the same formats for from and to.
interface FormatOptions<T extends FontTypeValues> {
	from: T;
	to: ExcludeSame<FontTypeValues, T>;
}

// Type mapping to exclude the selected format from another format.
type ExcludeSame<T, U> = T extends U ? never : T;

// Options for create object and transform font.
interface TransformOptions {
	create: FontCreateOptions; // Create font data.
	write: FontWriteOptions; // Transform font data.
}

interface CommonFontOptions {
	/**
	 * keep hinting table or not
	 *
	 * @default false
	 */
	hinting?: boolean;

	/**
	 * kerning table adjusting the space between individual letters or characters
	 *
	 * @default false
	 */
	kerning?: boolean;

	/**
	 * Transform compound glyph to simple,
	 *
	 * @default true
	 */
	compound2simple?: boolean;
}

interface FontCreateOptions extends CommonFontOptions {
	/**
	 * subset font file to specified unicode code points;
	 */
	subset?: number[];

	/**
	 * inflate function for woff
	 *
	 * @see pako.inflate https://github.com/nodeca/pako
	 */
	inflate?: (deflatedData: number[]) => number[];

	/**
	 * combine svg paths to one glyph in one svg file.
	 *
	 * @default true
	 */
	combinePath?: boolean;
}

interface FontWriteOptions extends CommonFontOptions {
	/**
	 * use Buffer when in Node environment, in browser will use ArrayBuffer.
	 * default true
	 */
	toBuffer?: boolean;

	/**
	 * write glyf data when simple glyph has no contours, default false
	 */
	writeZeroContoursGlyfData?: boolean;

	/**
	 * svg output meta data
	 */
	metadata?: string;

	/**
	 * deflate function for woff
	 *
	 * @see pako.deflate https://github.com/nodeca/pako
	 */
	deflate?: (rawData: number[]) => number[];

	/**
	 * for user to overwrite head.xMin, head.xMax, head.yMin, head.yMax, hhea etc.
	 */
	support?: {
		/**
		 * overwrite head
		 */
		head?: {
			xMin?: number;
			yMin?: number;
			xMax?: number;
			yMax?: number;
		};

		/**
		 * overwrite hhea
		 */
		hhea?: {
			advanceWidthMax?: number;
			xMaxExtent?: number;
			minLeftSideBearing?: number;
			minRightSideBearing?: number;
		};
	};
}

// Options for the Gulp Font Switcher plugin.
export interface GulpFontSwitcherOptions<T extends FontTypeValues> {
	format: FormatOptions<T>; // Output format.
	options?: TransformOptions; // Transform options.
	optimize?: boolean; // Font optimization
	sort?: boolean; // Font sorting
	toBase64?: boolean; // Output font data as base64 string.
	logStream?: boolean; // Parameter for logging by streams.
	logEnd?: boolean; // Parameter for logging by total.
}
