import { isFunction as isAnyFunction } from 'remeda';

/** A type guard for option schemas: `z.custom<Hook>(isFunction)` checks a callback without wrapping it. */
export const isFunction = (value: unknown): value is (...args: never[]) => unknown => isAnyFunction(value);
