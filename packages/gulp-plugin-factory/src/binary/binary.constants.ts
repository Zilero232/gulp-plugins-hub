/** U+FFFD in UTF-8: what every invalid byte becomes when binary data is decoded as text. */
export const REPLACEMENT_CHARACTER = Buffer.from('�');

/** Binary formats start with a signature, so the corruption shows within the first bytes. */
export const HEADER_LENGTH = 64;
