import type { INPUT_FORMATS, OUTPUT_FORMATS } from './font-switcher.constants';

export type FontFormat = (typeof OUTPUT_FORMATS)[number];

export type InputFontFormat = (typeof INPUT_FORMATS)[keyof typeof INPUT_FORMATS];
