import { SUPPORTED_INPUT_FORMATS } from '../constants';

// Check if the input format is supported.
export const isInputFormatSupported = (format: string): boolean => {
  return SUPPORTED_INPUT_FORMATS.includes(format);
};
