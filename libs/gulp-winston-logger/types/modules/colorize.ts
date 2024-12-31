import type { Logform as logform } from 'winston';

import type { LogLevelKeys } from './logger';

// Text styles.
type FontStyle =
	| 'bold' // Bold text.
	| 'dim' // Dimmed text.
	| 'italic' // Italic text.
	| 'underline' // Underlined text.
	| 'inverse' // Inverted text colors.
	| 'hidden' // Hidden text.
	| 'strikethrough'; // Strikethrough text.

// Text foreground colors.
type FontForegroundColor =
	| 'black' // Black text.
	| 'red' // Red text.
	| 'green' // Green text.
	| 'yellow' // Yellow text.
	| 'blue' // Blue text.
	| 'magenta' // Magenta text.
	| 'cyan' // Cyan text.
	| 'white' // White text.
	| 'gray' // Gray text.
	| 'grey'; // Grey text (alternative spelling for gray).

// Background colors.
type FontBackgroundColor =
	| 'blackBG' // Black background.
	| 'redBG' // Red background.
	| 'greenBG' // Green background.
	| 'yellowBG' // Yellow background.
	| 'blueBG' // Blue background.
	| 'magentaBG' // Magenta background.
	| 'cyanBG' // Cyan background.
	| 'whiteBG'; // White background.

// Combinations of text styles, foreground colors, and background colors for logs.
export type LogColorScheme =
	| `${FontForegroundColor}` // Single component present.
	| `${FontForegroundColor} ${FontStyle}` // Two components present.
	| `${FontForegroundColor} ${FontStyle} ${FontBackgroundColor}`; // All three components present.

// Colorize options.
export interface ColorizeOptions extends logform.ColorizeOptions {
	colors?: Record<LogLevelKeys, LogColorScheme>;
}
