import { isPlainObject } from 'remeda';

/** A type guard for option schemas: a plain options object, not null, not an array and not a class instance. */
export const isObject = (value: unknown): value is Record<string, unknown> => isPlainObject(value);
