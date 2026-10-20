/** Whether a path is a URL (`file://…`, `webpack://…`, `data:…`) rather than a file path. A drive letter is not. */
export const isUrl = (value: string): boolean => /^[a-z][\w+.-]+:/i.test(value);
